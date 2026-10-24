(function () {
  document.documentElement.dataset.page = "taxi-game";
  const monument = [54.9783, -1.6178];
  const map = L.map("play-map");
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  const circle = L.circle(monument, {
    radius: 80467,
    color: "#054a9e",
    weight: 2,
    fillColor: "#00BFFF",
    fillOpacity: 0.08,
    interactive: false
  }).addTo(map);
  map.setView(monument, 10);
  map.fitBounds(circle.getBounds());
  function clearBusToggle() {
    document.querySelectorAll("button, input, select").forEach((node) => {
      const label = ((node.textContent || "") + " " + (node.id || "") + " " + (node.getAttribute("aria-label") || "")).toLowerCase();
      if (label.indexOf("bus") === -1) return;
      node.remove();
    });
  }
  clearBusToggle();

  const depot = [55.0367, -1.5075];
  L.marker(depot, { title: "Shiremoor depot" })
    .bindTooltip("Shiremoor depot", { permanent: true, direction: "top" })
    .addTo(map);

  const PLAY_SIGNS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"];
  const FEED_COLOURS = {
    T1: "#f5b942",
    T2: "#38bdf8",
    T3: "#4ade80",
    T4: "#c084fc",
    T5: "#fb7185",
    T6: "#f97316",
    T7: "#a3e635",
    T8: "#22d3ee",
    T9: "#e879f9",
    T10: "#facc15"
  };
  const playChips = new Map();
  const playFares = [];
  let playFeed = null;
  let playClock = null;
  let playMotion = 0;

  function haversineKm(a, b) {
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad;
    const dLng = (b.lng - a.lng) * rad;
    const lat1 = a.lat * rad;
    const lat2 = b.lat * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function placeOnRoute(points, durationS, elapsedS) {
    if (!points.length) return null;
    if (durationS <= 0 || elapsedS <= 0) return points[0];
    if (elapsedS >= durationS) return points[points.length - 1];
    const fraction = elapsedS / durationS;
    const distances = [0];
    for (let i = 1; i < points.length; i++) {
      distances.push(distances[i - 1] + haversineKm(
        { lat: points[i - 1][0], lng: points[i - 1][1] },
        { lat: points[i][0], lng: points[i][1] }
      ));
    }
    const total = distances[distances.length - 1];
    if (total === 0) return points[0];
    const target = total * fraction;
    for (let j = 1; j < distances.length; j++) {
      if (distances[j] < target) continue;
      const span = distances[j] - distances[j - 1];
      const step = span === 0 ? 0 : (target - distances[j - 1]) / span;
      const start = points[j - 1];
      const end = points[j];
      return [start[0] + (end[0] - start[0]) * step, start[1] + (end[1] - start[1]) * step];
    }
    return points[points.length - 1];
  }

  function playNow() {
    if (!playClock) return Date.now() / 1000;
    return playClock.server + (Date.now() / 1000 - playClock.client);
  }

  function newCarLineReady() {
    const row = document.querySelector('[data-money="new_car"]');
    return !!(row && String(row.textContent).indexOf("800000") !== -1);
  }

  function playPlace(car, now) {
    const route = Array.isArray(car.route) ? car.route : [];
    const duration = Number(car.duration_s) || 0;
    const started = Number(car.leg_started) || 0;
    const elapsed = now - started;
    if (car.status === "at_depot" && !newCarLineReady()) return [55.0367, -1.5075];
    if (car.status === "returning" && (!route.length || elapsed >= duration)) return [55.0367, -1.5075];
    if (route.length) return placeOnRoute(route, duration, elapsed);
    const lat = Number(car.lat);
    const lng = Number(car.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return null;
  }

  function chipFill(car) {
    const fromFeed = car && typeof car.colour === "string" ? car.colour.trim() : "";
    if (/^#[0-9a-fA-F]{6}$/.test(fromFeed)) return fromFeed;
    return FEED_COLOURS[car.sign] || "#94a3b8";
  }

  function chipLabel(sign) {
    return String(sign || "").replace(/device/ig, "").trim();
  }

  function chipIcon(sign, fill) {
    const label = chipLabel(sign);
    const html = '<span class="play-chip" style="display:flex;align-items:center;justify-content:center;width:36px;height:22px;border-radius:6px;background:' + fill + ';color:#0c1219;font:700 11px/1 system-ui,sans-serif">' + label + "</span>";
    return L.divIcon({ className: "play-chip-icon", html: html, iconSize: [36, 22], iconAnchor: [18, 11] });
  }

  function apiBase() {
    return String(window.HACKATHON_API || "").replace(/\/$/, "");
  }

  function playFeedPath() {
    return "/v1/empire";
  }

  function playMayRequest(path) {
    const target = String(path);
    if (target.indexOf("office") !== -1 || target.indexOf("ledger") !== -1) return false;
    return target === "/v1/empire";
  }

  function feedPlace(car) {
    const lat = Number(car.lat);
    const lng = Number(car.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    return null;
  }

  function paintPlayCars(feed) {
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const seen = new Set();
    const list = document.getElementById("play-taxi-list");
    if (list) list.textContent = "";
    PLAY_SIGNS.forEach((sign) => {
      const car = cars.find((row) => row && row.sign === sign);
      if (!car) return;
      const reported = feedPlace(car);
      const place = reported || playPlace(car, playNow());
      if (!place) return;
      seen.add(sign);
      const fill = chipFill(car);
      let marker = playChips.get(sign);
      if (!marker) {
        marker = L.marker(place, {
          icon: chipIcon(sign, fill),
          title: chipLabel(sign)
        }).addTo(map);
        marker._playFill = fill;
        playChips.set(sign, marker);
      } else if (marker._playFill !== fill) {
        marker.setIcon(chipIcon(sign, fill));
        marker._playFill = fill;
      }
      if (list) {
        const item = document.createElement("li");
        item.textContent = reported ? sign + " " + reported[0] + ", " + reported[1] : sign;
        list.appendChild(item);
      }
    });
    playChips.forEach((marker, sign) => {
      if (seen.has(sign)) return;
      map.removeLayer(marker);
      playChips.delete(sign);
    });
  }

  function paintPlayFares(feed) {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const fares = feed && Array.isArray(feed.fares) ? feed.fares : [];
    fares.forEach((fare) => {
      if (!fare) return;
      const lat = Number(fare.lat);
      const lng = Number(fare.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const name = fare.name || "Passenger";
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "play-chip-icon",
          html: '<span class="play-fare" style="display:inline-block;padding:2px 6px;border-radius:6px;background:#fff;color:#0c1219;font:700 11px/1.2 system-ui,sans-serif;white-space:nowrap">' + name + " waiting</span>",
          iconSize: [120, 22],
          iconAnchor: [60, 22]
        }),
        title: name + " waiting",
        zIndexOffset: 650
      }).addTo(map);
      playFares.push(marker);
    });
  }

  function showPlayAccount() {
    const form = document.getElementById("play-account");
    if (form) form.hidden = false;
  }

  function hidePlayAccount() {
    const form = document.getElementById("play-account");
    if (form) form.hidden = true;
  }

  function clearPlayChips() {
    playChips.forEach((marker) => map.removeLayer(marker));
    playChips.clear();
    const list = document.getElementById("play-taxi-list");
    if (list) list.textContent = "";
  }

  function signOutPlay() {
    localStorage.removeItem("hackathon-empire-token");
    localStorage.removeItem("hackathon-empire-user");
    clearPlayChips();
    showPlayAccount();
    paintPlayStatus(null);
  }

  async function createPlayAccount() {
    const usernameEl = document.getElementById("play-username");
    const passwordEl = document.getElementById("play-password");
    const status = document.getElementById("play-account-status");
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    const base = apiBase();
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    const registered = await fetch(base + "/register", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    if (!registered.ok) {
      if (status) status.textContent = "Create account failed.";
      return;
    }
    const logged = await fetch(base + "/login", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    const session = await logged.json().catch(function () { return null; });
    if (!logged.ok || !session || !session.access_token) {
      if (status) status.textContent = "Sign in failed.";
      return;
    }
    localStorage.setItem("hackathon-empire-token", session.access_token);
    localStorage.setItem("hackathon-empire-user", username);
    if (status) status.textContent = "";
    hidePlayAccount();
    paintPlayStatus(null);
    pollPlay();
  }

  async function signInPlay(event) {
    event.preventDefault();
    const usernameEl = document.getElementById("play-username");
    const passwordEl = document.getElementById("play-password");
    const status = document.getElementById("play-account-status");
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    const base = apiBase();
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    const logged = await fetch(base + "/login", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password })
    });
    const session = await logged.json().catch(function () { return null; });
    if (!logged.ok || !session || !session.access_token) {
      if (status) status.textContent = "Sign in failed.";
      return;
    }
    localStorage.setItem("hackathon-empire-token", session.access_token);
    localStorage.setItem("hackathon-empire-user", username);
    if (status) status.textContent = "";
    hidePlayAccount();
    paintPlayStatus(null);
    pollPlay();
  }

  async function pollPlay() {
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const base = apiBase();
    if (!token || !base) return;
    const path = playFeedPath();
    if (!playMayRequest(path) || path.indexOf("/v1/devices") !== -1) return;
    const res = await fetch(base + path, {
      headers: { Authorization: "Bearer " + token }
    });
    if (res.status === 401) {
      localStorage.removeItem("hackathon-empire-token");
      paintPlayStatus(null);
      showPlayAccount();
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    playFeed = data;
    const server = Number(data.server_now);
    if (Number.isFinite(server)) playClock = { server: server, client: Date.now() / 1000 };
    clearBusToggle();
    hidePlayAccount();
    paintPlayStatus(data);
    paintPlayMoney(data);
    paintPlayCars(data);
    paintPlayFares(data);
    paintPlayOsrm(data);
    if (!playMotion) playMotion = requestAnimationFrame(glidePlay);
  }

  function glidePlay() {
    playMotion = 0;
    const cars = playFeed && Array.isArray(playFeed.cars) ? playFeed.cars : [];
    const now = playNow();
    cars.forEach((car) => {
      if (!car || !PLAY_SIGNS.includes(car.sign)) return;
      const marker = playChips.get(car.sign);
      if (!marker) return;
      const place = playPlace(car, now);
      if (place) marker.setLatLng(place);
    });
    playMotion = requestAnimationFrame(glidePlay);
  }

  function statusName(value) {
    const name = typeof value === "string" ? value.trim() : "";
    if (!name || name === "2860" || name === "1130" || name === "1240" || name === "-1120") return "";
    return name;
  }

  function paintPlayStatus(feed) {
    const line = document.getElementById("play-status");
    if (!line) return;
    const fleet = "The fleet runs on the box.";
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const fromFeed = statusName(feed && feed.username);
    const fromStore = statusName(localStorage.getItem("hackathon-empire-user"));
    const who = token ? (fromFeed || fromStore) : "";
    line.textContent = who ? who + ". " + fleet : fleet;
  }

  function paintPlayOsrm(feed) {
    const line = document.getElementById("play-osrm");
    if (!line) return;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const missing = (feed && feed.osrm_unavailable === true) || cars.some((car) => car && car.osrm === false);
    line.textContent = missing ? "OSRM unavailable" : "";
  }

  function shownPence(value) {
    const pence = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
    if (pence === 2860 || pence === 1130 || pence === 1240 || pence === -1120) return "";
    return String(pence);
  }

  function paintPlayMoney(feed) {
    ["fare_in", "driver_share", "fuel", "standing", "new_car"].forEach((key) => {
      const row = document.querySelector('[data-money="' + key + '"]');
      if (!row) return;
      row.textContent = key + " " + shownPence(feed && feed[key]);
    });
  }

  const playAccount = document.getElementById("play-account");
  if (playAccount) playAccount.addEventListener("submit", signInPlay);
  const playCreate = document.getElementById("play-create");
  if (playCreate) playCreate.addEventListener("click", createPlayAccount);
  const playSignOut = document.getElementById("play-signout");
  if (playSignOut) playSignOut.addEventListener("click", signOutPlay);
  if (!(localStorage.getItem("hackathon-empire-token") || "")) showPlayAccount();
  paintPlayStatus(null);
  setInterval(pollPlay, 2000);
  pollPlay();
})();
