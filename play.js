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
  function seatPlayScreen() {
    const nav = document.querySelector(".site-nav");
    const top = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty("--play-nav", top + "px");
    map.invalidateSize();
    keepDepotClear();
    keepStatusClear();
  }
  function keepStatusClear() {
    const status = document.getElementById("play-status");
    const zoom = document.querySelector("#play-map .leaflet-control-zoom");
    const node = document.getElementById("play-zoom-clear");
    if (!status) return;
    status.style.marginLeft = "0px";
    if (zoom) {
      const zoomBox = zoom.getBoundingClientRect();
      let box = status.getBoundingClientRect();
      const hits = function (rect) {
        return rect.left < zoomBox.right && rect.right > zoomBox.left && rect.top < zoomBox.bottom && rect.bottom > zoomBox.top;
      };
      if (hits(box)) status.style.marginLeft = Math.ceil(zoomBox.right - box.left + 12) + "px";
      box = status.getBoundingClientRect();
      if (node) node.dataset.cover = hits(box) ? "covers" : "clear";
    } else if (node) {
      node.dataset.cover = "clear";
    }
    if (node) node.dataset.zoom = zoom ? "control" : "absent";
  }
  function keepDepotClear() {
    const money = document.getElementById("play-money");
    const mapEl = document.getElementById("play-map");
    const node = document.getElementById("play-depot-clear");
    if (!money || !mapEl) return;
    const pin = map.latLngToContainerPoint(L.latLng(55.0367, -1.5075));
    const mapBox = mapEl.getBoundingClientRect();
    const x = mapBox.left + pin.x;
    const y = mapBox.top + pin.y;
    money.style.marginTop = "0px";
    let box = money.getBoundingClientRect();
    const hits = function (rect) {
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };
    if (hits(box)) money.style.marginTop = Math.ceil(y - box.top + 36) + "px";
    box = money.getBoundingClientRect();
    const clear = !hits(box);
    if (node) {
      node.dataset.cover = clear ? "clear" : "covers";
      node.dataset.pin = "55.0367,-1.5075";
    }
  }
  seatPlayScreen();
  map.fitBounds(circle.getBounds());
  window.addEventListener("resize", seatPlayScreen);
  map.on("moveend", keepDepotClear);
  function clearBusToggle() {
    document.querySelectorAll("button, input, select").forEach((node) => {
      const label = ((node.textContent || "") + " " + (node.id || "") + " " + (node.getAttribute("aria-label") || "")).toLowerCase();
      if (label.indexOf("bus") === -1) return;
      node.remove();
    });
  }
  function clearOfficeGrid() {
    document.querySelectorAll(".office-grid, #quote-form, #quote-result, #btn-quote, #btn-add, #empty-book, #ledger-slips, #day-ledger, #ledger-total").forEach((node) => {
      if (!node || node.id === "play-ledger" || node.id === "play-office-grid") return;
      node.remove();
    });
  }
  function clearPhoneList() {
    document.querySelectorAll("ul, ol, section, button, h2, h3").forEach((node) => {
      if (!node || node.id === "play-phones") return;
      const label = ((node.id || "") + " " + String(node.className || "") + " " + (node.getAttribute("aria-label") || "")).toLowerCase();
      if (label.indexOf("phone") === -1) return;
      node.remove();
    });
  }
  function clearPlaceStops() {
    document.querySelectorAll("button, input, select").forEach((node) => {
      if (!node || node.id === "play-stops") return;
      const label = ((node.textContent || "") + " " + (node.id || "") + " " + (node.getAttribute("aria-label") || "")).toLowerCase();
      if (label.indexOf("place stops") === -1 && node.id !== "btn-stops") return;
      node.remove();
    });
  }
  function keepPlayMoney() {
    const screen = document.getElementById("play-screen");
    const money = document.getElementById("play-money");
    if (screen) screen.hidden = false;
    if (money) money.hidden = false;
  }

  function seatPlayLocks() {
    const under = document.getElementById("play-under-map");
    const mapEl = document.getElementById("play-map");
    const screen = document.getElementById("play-screen");
    if (!under || !mapEl) return;
    if (screen && screen.contains(mapEl)) {
      if (under.previousElementSibling !== screen) screen.insertAdjacentElement("afterend", under);
    } else if (mapEl.parentNode && under.previousElementSibling !== mapEl) {
      mapEl.insertAdjacentElement("afterend", under);
    }
    [
      "play-moving",
      "play-bought-moves",
      "play-bought-trail",
      "play-trail-colour",
      "play-trail-order",
      "play-trail-age",
      "play-trail-replace",
      "play-trail-chip",
      "play-depot-chip",
      "play-t11-only",
      "play-price-still",
      "play-buy-flight",
      "play-buy-once",
      "play-spent-feed",
      "play-fare-in",
      "play-buy-reject",
      "play-started-screen",
      "play-started-ten",
      "play-signed-again",
      "play-cash-pence",
      "play-depot-clear",
      "play-zoom-clear",
      "play-signout-flight",
      "play-next-account",
      "play-fare-t12",
      "play-next-feed",
      "play-feed-401",
      "play-fare-name",
      "play-buy-cleared",
      "play-with-passenger",
      "play-signout-failed",
      "play-driver-share",
      "play-to-passenger",
      "play-fare-riding",
      "play-signed-chips",
      "play-person-waiting",
      "play-person-stays",
      "play-car-job",
      "play-next-failed",
      "play-next-trail",
      "play-next-fares",
      "play-feed-401-fares",
      "play-feed-401-failed",
      "play-feed-401-chips",
      "play-signout-fares",
      "play-quiet-failed",
      "play-quiet-spent",
      "play-quiet-fares",
      "play-quiet-chips",
      "play-signout-money",
      "play-quiet-money",
      "play-signout-person",
      "play-feed-401-person",
      "play-locks",
      "play-osrm",
      "play-buses",
      "play-phones",
      "play-stops",
      "play-depot",
      "play-dead-token",
      "play-from-feed",
      "play-standin",
      "play-returning",
      "play-bought",
      "play-ledger",
      "play-pence",
      "play-office-grid",
      "play-totals"
    ].forEach((id) => {
      const node = document.getElementById(id);
      if (!node || node.parentElement === under) return;
      under.appendChild(node);
    });
    keepPlayMoney();
  }
  clearBusToggle();
  clearOfficeGrid();
  clearPhoneList();
  clearPlaceStops();
  seatPlayLocks();

  const depot = [55.0367, -1.5075];
  L.marker(depot, { title: "Shiremoor depot" })
    .bindTooltip("Shiremoor depot 55.0367, -1.5075", { permanent: true, direction: "top" })
    .addTo(map);

  const PLAY_SIGNS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10"];
  const PLAY_SECOND = 1;
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
  const playPeople = [];
  const playTrails = [];
  const playTrailFed = new Map();
  let playFeed = null;
  let playFeedEpoch = 0;
  let playFed = false;
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
    const elapsed = Date.now() / 1000 - playClock.client;
    return playClock.server + elapsed * PLAY_SECOND;
  }

  function newCarLineReady() {
    const row = document.querySelector('[data-money="new_car"]');
    return !!(row && String(row.textContent).indexOf("800000") !== -1);
  }

  function boughtAtDepot(car) {
    if (!car || car.status !== "at_depot") return false;
    const sign = String(car.sign || "");
    return PLAY_SIGNS.indexOf(sign) === -1;
  }

  function tenIgnoreNewCarLine(car) {
    const sign = String(car && car.sign || "");
    return PLAY_SIGNS.indexOf(sign) !== -1;
  }

  function notePriceStill() {
    const node = document.getElementById("play-price-still");
    if (!node) return;
    node.dataset.moves = "no";
  }

  function noteBoughtDepot() {
    const node = document.getElementById("play-depot-chip");
    if (!node) return;
    node.dataset.pin = "55.0367,-1.5075";
    node.dataset.placedBy = "status";
  }

  function playPlace(car, now) {
    const route = Array.isArray(car.route) ? car.route : [];
    const duration = Number(car.duration_s) || 0;
    const started = Number(car.leg_started) || 0;
    const elapsed = now - started;
    if (boughtAtDepot(car)) return [55.0367, -1.5075];
    if (car.status === "at_depot" && !tenIgnoreNewCarLine(car) && !newCarLineReady()) return [55.0367, -1.5075];
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

  function trailColour(car) {
    const fromFeed = car && typeof car.colour === "string" ? car.colour.trim() : "";
    if (/^#[0-9a-fA-F]{6}$/.test(fromFeed)) return fromFeed;
    const sign = String(car && car.sign || "");
    if (PLAY_SIGNS.indexOf(sign) !== -1 && FEED_COLOURS[sign]) return FEED_COLOURS[sign];
    return "#94a3b8";
  }

  function chipLabel(sign) {
    return String(sign || "").replace(/device/ig, "").trim();
  }

  function carJob(car) {
    if (!car) return "";
    const raw = String(car.job || car.status || "").trim();
    if (raw === "waiting" || raw === "at_depot") return "waiting";
    if (raw === "travelling to a better spot" || raw === "travelling" || raw === "to_better_spot") return "travelling to a better spot";
    if (raw === "collecting" || raw === "to_passenger") return "collecting";
    if (raw === "carrying" || raw === "with_passenger") return "carrying";
    if (raw === "returning") return "returning";
    return "";
  }

  function chipIcon(sign, fill, job) {
    const label = chipLabel(sign);
    const text = job ? label + " " + job : label;
    const width = Math.max(36, 8 + text.length * 7);
    const html = '<span class="play-chip" style="display:flex;align-items:center;justify-content:center;min-width:' + width + 'px;height:22px;padding:0 4px;border-radius:6px;background:' + fill + ';color:#0c1219;font:700 11px/1 system-ui,sans-serif;white-space:nowrap">' + text + "</span>";
    return L.divIcon({ className: "play-chip-icon", html: html, iconSize: [width, 22], iconAnchor: [width / 2, 11] });
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

  function clearStandInTaxis() {
    if (playFed) return;
    playChips.forEach((marker) => map.removeLayer(marker));
    playChips.clear();
    const list = document.getElementById("play-taxi-list");
    if (list) list.textContent = "";
  }

  function drawnPlaySign(sign) {
    const name = String(sign || "");
    if (PLAY_SIGNS.indexOf(name) !== -1) return true;
    return name === "T11";
  }

  function noteT11Only() {
    const node = document.getElementById("play-t11-only");
    if (!node) return;
    node.dataset.t11 = playChips.has("T11") ? "drawn" : "waiting";
    node.dataset.t12 = playChips.has("T12") ? "drawn" : "not-drawn";
  }

  function paintPlayCars(feed) {
    if (!playFed) return;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const seen = new Set();
    const list = document.getElementById("play-taxi-list");
    if (list) list.textContent = "";
    function paintOne(car) {
      if (!car) return;
      const sign = String(car.sign || "");
      if (!sign || seen.has(sign)) return;
      const reported = feedPlace(car);
      const place = boughtAtDepot(car) ? [55.0367, -1.5075] : (reported || playPlace(car, playNow()));
      if (!place) return;
      seen.add(sign);
      if (boughtAtDepot(car)) noteBoughtDepot();
      const fill = chipFill(car);
      const job = carJob(car);
      const title = job ? chipLabel(sign) + " " + job : chipLabel(sign);
      let marker = playChips.get(sign);
      if (!marker) {
        marker = L.marker(place, {
          icon: chipIcon(sign, fill, job),
          title: title
        }).addTo(map);
        marker._playFill = fill;
        marker._playJob = job;
        playChips.set(sign, marker);
      } else if (marker._playFill !== fill || marker._playJob !== job) {
        marker.setIcon(chipIcon(sign, fill, job));
        marker._playFill = fill;
        marker._playJob = job;
      }
      marker.options.title = title;
      if (marker._icon) marker._icon.title = title;
      if (list) {
        const item = document.createElement("li");
        let text = reported ? sign + " " + reported[0] + ", " + reported[1] : sign;
        text += listStatus(car);
        item.dataset.sign = sign;
        item.textContent = text;
        list.appendChild(item);
      }
    }
    PLAY_SIGNS.forEach((sign) => {
      const car = cars.find((row) => row && row.sign === sign);
      if (car) paintOne(car);
    });
    cars.forEach((car) => {
      if (!car || PLAY_SIGNS.indexOf(car.sign) !== -1) return;
      if (!drawnPlaySign(car.sign)) return;
      paintOne(car);
    });
    playChips.forEach((marker, sign) => {
      if (seen.has(sign)) return;
      map.removeLayer(marker);
      playChips.delete(sign);
    });
    dropSecondTen();
    noteT11Only();
    notePriceStill();
    noteSignedAgain(feed);
    noteWithPassenger();
    noteToPassenger();
    noteCarJob();
  }

  function listStatus(car) {
    const job = carJob(car);
    return job ? " " + job : "";
  }

  function noteCarJob() {
    const node = document.getElementById("play-car-job");
    if (!node) return;
    const jobs = ["waiting", "travelling to a better spot", "collecting", "carrying", "returning"];
    const list = document.getElementById("play-taxi-list");
    const text = list ? list.textContent : "";
    const listed = [];
    const chips = [];
    jobs.forEach((job) => {
      if (text.indexOf(" " + job) !== -1) listed.push(job);
      playChips.forEach((marker) => {
        const title = marker && marker.options ? String(marker.options.title || "") : "";
        if (title.indexOf(job) !== -1 && chips.indexOf(job) === -1) chips.push(job);
      });
    });
    node.dataset.list = listed.join(",");
    node.dataset.chip = chips.join(",");
  }

  function noteWithPassenger() {
    const node = document.getElementById("play-with-passenger");
    if (!node) return;
    const list = document.getElementById("play-taxi-list");
    const text = list ? list.textContent : "";
    node.dataset.named = text.indexOf(" is with_passenger") === -1 ? "no" : "yes";
    node.dataset.returning = text.indexOf(" is returning") === -1 ? "no" : "yes";
  }

  function noteToPassenger() {
    const node = document.getElementById("play-to-passenger");
    if (!node) return;
    const list = document.getElementById("play-taxi-list");
    const text = list ? list.textContent : "";
    node.dataset.named = text.indexOf(" is to_passenger") === -1 ? "no" : "yes";
    node.dataset.returning = text.indexOf(" is returning") === -1 ? "no" : "yes";
  }

  function dropSecondTen() {
    const list = document.getElementById("play-taxi-list");
    if (!list) return;
    const once = new Set();
    Array.from(list.children).forEach((item) => {
      const sign = item.dataset.sign || "";
      if (PLAY_SIGNS.indexOf(sign) === -1) return;
      if (once.has(sign)) item.remove();
      else once.add(sign);
    });
  }

  let playSignAgain = false;

  function noteSignedAgain(feed) {
    const node = document.getElementById("play-signed-again");
    if (!node || !playSignAgain) return;
    const list = document.getElementById("play-taxi-list");
    let doubled = false;
    PLAY_SIGNS.forEach((sign) => {
      if (!list) return;
      if (list.querySelectorAll('[data-sign="' + sign + '"]').length > 1) doubled = true;
    });
    const listed = feedListsT11(feed);
    node.dataset.t11 = listed && playChips.has("T11") ? "shown" : "absent";
    node.dataset.ten = doubled ? "doubled" : "once";
  }

  function clearPlayTrails() {
    playTrails.forEach((line) => map.removeLayer(line));
    playTrails.length = 0;
  }

  function trailPoint(row) {
    if (!Array.isArray(row) || row.length < 3) return null;
    const lng = Number(row[0]);
    const lat = Number(row[1]);
    const at = Number(row[2]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(at)) return null;
    return { lat: lat, lng: lng, at: at };
  }

  const TRAIL_TEN_MINUTES = 600;

  function boughtTrailSeconds(car) {
    const sign = String(car && car.sign || "");
    if (PLAY_SIGNS.indexOf(sign) !== -1) return null;
    return TRAIL_TEN_MINUTES;
  }

  function noteBoughtTrailAge(dropped) {
    const node = document.getElementById("play-trail-age");
    if (!node) return;
    node.dataset.minutes = "10";
    node.dataset.dropped = String(dropped);
  }

  function trailStamp(point) {
    return String(point.lng) + "," + String(point.lat) + "," + String(point.at);
  }

  function noteTrailReplaced(signs) {
    const node = document.getElementById("play-trail-replace");
    if (!node) return;
    node.dataset.replaced = "feed";
    node.dataset.signs = signs.join(",");
  }

  function keepTrailChip(sign) {
    const marker = playChips.get(String(sign));
    if (!marker) return false;
    if (!map.hasLayer(marker)) marker.addTo(map);
    marker._keptWithTrail = true;
    return true;
  }

  function noteTrailChips(signs) {
    const node = document.getElementById("play-trail-chip");
    if (!node) return;
    node.dataset.kept = signs.join(",");
  }

  function paintPlayTrails(feed) {
    clearPlayTrails();
    const keep = Number(feed && feed.trail_s);
    const trailS = Number.isFinite(keep) && keep > 0 ? keep : 600;
    const now = playNow();
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const fedSigns = [];
    const keptSigns = [];
    cars.forEach((car) => {
      if (!car || !car.sign || !Array.isArray(car.trail)) return;
      if (!drawnPlaySign(car.sign)) return;
      const sign = String(car.sign);
      const boughtS = boughtTrailSeconds(car);
      const keepS = boughtS === null ? trailS : boughtS;
      const points = [];
      const stamps = [];
      let dropped = 0;
      car.trail.forEach((row) => {
        const point = trailPoint(row);
        if (!point) return;
        if (now - point.at > keepS) {
          if (boughtS !== null) dropped += 1;
          return;
        }
        stamps.push(trailStamp(point));
        points.push([point.lat, point.lng]);
      });
      playTrailFed.set(sign, stamps);
      fedSigns.push(sign);
      if (boughtS !== null) noteBoughtTrailAge(dropped);
      if (points.length < 2) return;
      const line = L.polyline(points, {
        color: trailColour(car),
        weight: 4,
        opacity: 0.7
      }).addTo(map);
      line._feedStamps = stamps.slice();
      playTrails.push(line);
      if (keepTrailChip(sign)) keptSigns.push(sign);
    });
    const stale = [];
    playTrailFed.forEach(function (stamps, sign) {
      if (fedSigns.indexOf(sign) === -1) stale.push(sign);
    });
    stale.forEach(function (sign) { playTrailFed.delete(sign); });
    noteTrailReplaced(fedSigns);
    noteTrailChips(keptSigns);
  }

  function paintPlayFares(feed) {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const fares = feed && Array.isArray(feed.fares) ? feed.fares : [];
    let skippedT12 = 0;
    let skippedRiding = 0;
    const fareNames = [];
    fares.forEach((fare) => {
      if (!fare) return;
      if (String(fare.sign || "") === "T12") {
        skippedT12 += 1;
        return;
      }
      if (fareCarRiding(feed, fare)) {
        skippedRiding += 1;
        return;
      }
      const lat = Number(fare.lat);
      const lng = Number(fare.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const name = fare.name || "Passenger";
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "play-chip-icon",
          html: '<span class="play-fare" style="display:inline-block;padding:2px 6px;border-radius:6px;background:#fff;color:#0c1219;font:700 11px/1.2 system-ui,sans-serif;white-space:nowrap">' + name + "</span>",
          iconSize: [120, 22],
          iconAnchor: [60, 22]
        }),
        title: name,
        zIndexOffset: 650
      }).addTo(map);
      playFares.push(marker);
      fareNames.push(name);
    });
    const note = document.getElementById("play-fare-t12");
    if (note) {
      note.dataset.t12 = skippedT12 ? "hidden" : "none";
      note.dataset.skipped = String(skippedT12);
    }
    noteFareName(fareNames);
    noteFareRiding(skippedRiding);
  }

  function personTaxiSign(person) {
    if (!person) return "";
    return String(person.sign || person.taxi || "").trim();
  }

  function allocatedTaxiArrived(feed, person) {
    if (!person) return false;
    if (person.arrived === true) return true;
    const sign = personTaxiSign(person);
    if (!sign) return false;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    return cars.some(function (car) {
      return !!(car && String(car.sign || "") === sign && car.status === "with_passenger");
    });
  }

  function paintPlayPeople(feed) {
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    const people = feed && Array.isArray(feed.people) ? feed.people : [];
    let drawn = 0;
    let stayed = 0;
    let arrived = 0;
    people.forEach((person) => {
      if (!person) return;
      if (allocatedTaxiArrived(feed, person)) {
        arrived += 1;
        return;
      }
      const lat = Number(person.lat);
      const lng = Number(person.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const name = person.name || "Person";
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "play-chip-icon",
          html: '<span class="play-person" style="display:inline-block;padding:2px 6px;border-radius:999px;background:#111827;color:#f8fafc;font:700 11px/1.2 system-ui,sans-serif;white-space:nowrap">' + name + "</span>",
          iconSize: [120, 22],
          iconAnchor: [60, 22]
        }),
        title: name,
        zIndexOffset: 700
      }).addTo(map);
      playPeople.push(marker);
      drawn += 1;
      if (person.allocated === true || personTaxiSign(person)) stayed += 1;
    });
    notePersonWaiting(drawn, stayed);
    notePersonStays(stayed, arrived);
  }

  function notePersonWaiting(drawn, stayed) {
    const node = document.getElementById("play-person-waiting");
    if (!node) return;
    node.dataset.person = drawn ? "drawn" : "none";
    node.dataset.drawn = String(drawn);
    node.dataset.allocated = String(stayed);
  }

  function notePersonStays(stayed, arrived) {
    const node = document.getElementById("play-person-stays");
    if (!node) return;
    node.dataset.stayed = stayed ? "stays" : "none";
    node.dataset.arrived = String(arrived);
  }

  function fareCarRiding(feed, fare) {
    const sign = String(fare && fare.sign || "");
    if (!sign) return false;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    return cars.some(function (car) {
      return !!(car && String(car.sign || "") === sign && car.status === "with_passenger");
    });
  }

  function noteFareRiding(skipped) {
    const node = document.getElementById("play-fare-riding");
    if (!node) return;
    node.dataset.riding = skipped ? "hidden" : "none";
    node.dataset.skipped = String(skipped);
  }

  function noteFareName(names) {
    const node = document.getElementById("play-fare-name");
    if (!node) return;
    node.dataset.text = "name";
    node.dataset.pins = String(names.length);
  }

  function showPlayAccount() {
    const form = document.getElementById("play-account");
    if (form) form.hidden = false;
    const start = document.getElementById("play-start");
    if (start) start.hidden = false;
    const signIn = document.getElementById("play-signin");
    const create = document.getElementById("play-create");
    if (signIn) signIn.hidden = true;
    if (create) create.hidden = true;
  }

  function keepPlayMap() {
    const page = document.getElementById("play-map-page");
    const mapEl = document.getElementById("play-map");
    if (page) page.hidden = false;
    if (mapEl) mapEl.hidden = false;
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

  function dropBoughtChips() {
    Array.from(playChips.keys()).forEach((sign) => {
      if (PLAY_SIGNS.indexOf(sign) !== -1) return;
      const marker = playChips.get(sign);
      if (marker) map.removeLayer(marker);
      playChips.delete(sign);
      const item = document.querySelector('#play-taxi-list [data-sign="' + sign + '"]');
      if (item) item.remove();
    });
  }

  function signOutPlay() {
    localStorage.removeItem("hackathon-empire-token");
    localStorage.removeItem("hackathon-empire-user");
    playSignAgain = false;
    dropBoughtChips();
    clearPlayChips();
    const leftDuringBuy = playBuying;
    clearPlaySpent();
    clearPlayTrails();
    showPlayAccount();
    paintPlayStatus(null);
    paintPlayBuy();
    if (leftDuringBuy) {
      clearPlaySpent();
      noteSignOutFlight();
    }
    clearSignOutFailed();
    clearSignOutFares();
    clearSignOutMoney();
    clearSignOutPeople();
  }

  function clearSignOutFares() {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-signout-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.signed = "out";
  }

  function clearSignOutMoney() {
    const rows = document.querySelectorAll("#play-money-lines li");
    rows.forEach((row) => {
      row.textContent = "";
    });
    const node = document.getElementById("play-signout-money");
    if (!node) return;
    let showing = false;
    rows.forEach((row) => {
      if (row.textContent) showing = true;
    });
    node.dataset.money = showing ? "shows" : "clear";
    node.dataset.signed = "out";
  }

  function clearSignOutPeople() {
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    const node = document.getElementById("play-signout-person");
    if (!node) return;
    node.dataset.person = playPeople.length === 0 ? "clear" : "shows";
    node.dataset.signed = "out";
  }

  function clearSignOutFailed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-signout-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.signed = "out";
  }

  function noteSignOutFlight() {
    const node = document.getElementById("play-signout-flight");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.flight = "left";
  }

  let playBuying = false;

  function playBuyPence() {
    return 800000;
  }

  function noteBuyFlight() {
    const node = document.getElementById("play-buy-flight");
    if (!node) return;
    node.dataset.flight = playBuying ? "in-flight" : "ready";
    node.dataset.pence = String(playBuyPence());
  }

  function paintPlaySpent(feed) {
    const line = document.getElementById("play-spent");
    if (!line) return;
    const token = !!(localStorage.getItem("hackathon-empire-token") || "");
    if (token && feedListsT11(feed)) line.textContent = String(playBuyPence()) + " pence spent";
    else line.textContent = "";
    const note = document.getElementById("play-spent-feed");
    if (!note) return;
    note.dataset.spent = line.textContent ? "t11" : "empty";
  }

  function showPlaySpent() {
    paintPlaySpent(playFeed);
  }

  function clearPlaySpent() {
    const line = document.getElementById("play-spent");
    if (line) line.textContent = "";
  }

  function noteBuyReject() {
    const node = document.getElementById("play-buy-reject");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const start = document.getElementById("play-start");
    const mapEl = document.getElementById("play-map");
    const page = document.getElementById("play-map-page");
    const mapStays = !!(page && page.hidden === false && mapEl && mapEl.hidden === false);
    node.dataset.spent = line && line.textContent === "" ? "cleared" : "shows";
    node.dataset.start = start && start.hidden === false ? "back" : "away";
    node.dataset.map = mapStays ? "stays" : "gone";
    node.dataset.screen = mapStays ? "full" : "hidden";
    node.dataset.pence = String(playBuyPence());
  }

  function clearFeed401Chips() {
    clearPlayChips();
    const list = document.getElementById("play-taxi-list");
    const node = document.getElementById("play-feed-401-chips");
    if (!node) return;
    node.dataset.chips = playChips.size === 0 ? "clear" : "shows";
    node.dataset.list = list && list.textContent === "" ? "clear" : "shows";
    node.dataset.feed = "401";
  }

  function clearFeed401Failed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-feed-401-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.feed = "401";
  }

  function clearFeed401Fares() {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-feed-401-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.feed = "401";
  }

  function clearFeed401People() {
    playPeople.forEach((marker) => map.removeLayer(marker));
    playPeople.length = 0;
    const node = document.getElementById("play-feed-401-person");
    if (!node) return;
    node.dataset.person = playPeople.length === 0 ? "clear" : "shows";
    node.dataset.feed = "401";
  }

  function noteFeed401() {
    const node = document.getElementById("play-feed-401");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.chip = playChips.has("T11") ? "stays" : "gone";
    node.dataset.feed = "empire";
  }

  function seatPlayBuy() {
    const money = document.getElementById("play-money");
    const mapEl = document.getElementById("play-map");
    const row = document.getElementById("play-buy-row");
    const note = document.getElementById("play-buy-sits");
    const button = document.getElementById("play-buy");
    if (money && row && !money.contains(row)) money.appendChild(row);
    if (money && note && !money.contains(note)) money.appendChild(note);
    ["play-spent-rule", "play-spent"].forEach((id) => {
      const node = document.getElementById(id);
      if (money && node && !money.contains(node)) money.appendChild(node);
    });
    if (!button) return;
    button.style.position = "static";
    button.style.inset = "auto";
    button.style.zIndex = "auto";
    if (mapEl && mapEl.contains(button) && money) money.appendChild(button);
  }

  function feedListsT11(feed) {
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    return cars.some(function (car) {
      return !!(car && String(car.sign) === "T11");
    });
  }

  function noteBuyOnce(listed) {
    const node = document.getElementById("play-buy-once");
    if (!node) return;
    node.dataset.offered = listed ? "no" : "yes";
    node.dataset.pence = String(playBuyPence());
  }

  function paintPlayBuy() {
    const button = document.getElementById("play-buy");
    seatPlayBuy();
    if (!button) return;
    const listed = feedListsT11(playFeed);
    button.textContent = "Buy the next car for " + playBuyPence();
    const token = !!(localStorage.getItem("hackathon-empire-token") || "");
    button.hidden = !token || listed;
    button.disabled = playBuying;
    noteBuyOnce(listed);
    paintPlaySpent(playFeed);
  }

  async function buyPlayCar() {
    if (playBuying) return;
    if (feedListsT11(playFeed)) return;
    const status = document.getElementById("play-buy-status");
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const base = apiBase();
    if (!token || !base) {
      if (status) status.textContent = "";
      showPlayAccount();
      return;
    }
    playBuying = true;
    noteBuyFlight();
    paintPlayBuy();
    let res;
    try {
      res = await fetch(base + "/v1/empire/buy", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ pence: playBuyPence() })
      });
    } catch (err) {
      if (localStorage.getItem("hackathon-empire-token") || "") {
        if (status) status.textContent = "Buy failed.";
      }
      return;
    } finally {
      playBuying = false;
      noteBuyFlight();
      paintPlayBuy();
      if (!(localStorage.getItem("hackathon-empire-token") || "")) {
        clearPlaySpent();
        noteSignOutFlight();
      }
    }
    if (!(localStorage.getItem("hackathon-empire-token") || "")) return;
    if (res.status === 401) {
      localStorage.removeItem("hackathon-empire-token");
      paintPlayStatus(null);
      showPlayAccount();
      keepPlayMap();
      paintPlayBuy();
      clearPlaySpent();
      noteBuyReject();
      return;
    }
    if (!res.ok) {
      if (status) status.textContent = "Buy failed.";
      return;
    }
    if (status) status.textContent = "";
    showPlaySpent();
    pollPlay();
  }

  function clearSpentForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    clearPlaySpent();
    const node = document.getElementById("play-next-account");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.account = "next";
  }

  function clearFailedForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-next-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.account = "next";
  }

  function clearTrailForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    clearPlayTrails();
    playTrailFed.clear();
    const node = document.getElementById("play-next-trail");
    if (!node) return;
    node.dataset.trail = playTrails.length === 0 && playTrailFed.size === 0 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearFaresForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return;
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-next-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.feed = "waiting";
  }

  function clearFeedForNextAccount(username) {
    const previous = localStorage.getItem("hackathon-empire-user") || "";
    if (!previous || previous === username) return false;
    playFeed = null;
    playFeedEpoch += 1;
    return true;
  }

  function noteNextFeed() {
    const node = document.getElementById("play-next-feed");
    if (!node) return;
    const button = document.getElementById("play-buy");
    const token = !!(localStorage.getItem("hackathon-empire-token") || "");
    node.dataset.feed = playFeed ? "held" : "clear";
    node.dataset.t11 = feedListsT11(playFeed) ? "listed" : "gone";
    node.dataset.buy = token && button && !button.hidden ? "offered" : "hidden";
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
    clearSpentForNextAccount(username);
    clearFailedForNextAccount(username);
    const clearedFeed = clearFeedForNextAccount(username);
    clearTrailForNextAccount(username);
    clearFaresForNextAccount(username);
    localStorage.setItem("hackathon-empire-token", session.access_token);
    localStorage.setItem("hackathon-empire-user", username);
    if (clearedFeed) {
      paintPlayBuy();
      noteNextFeed();
    }
    if (status) status.textContent = "";
    hidePlayAccount();
    paintPlayStatus(null);
    pollPlay();
  }

  function accountProblem(body, fallback) {
    let msg = "";
    if (body && typeof body.detail === "string" && body.detail) msg = body.detail;
    else if (body && Array.isArray(body.detail) && body.detail[0] && body.detail[0].msg) msg = String(body.detail[0].msg);
    msg = msg.replace(/^Value error,\s*/i, "");
    return msg || fallback;
  }

  function keepStartedScreen() {
    const screen = document.getElementById("play-screen");
    const money = document.getElementById("play-money");
    const mapEl = document.getElementById("play-map");
    keepPlayMap();
    keepPlayMoney();
    if (screen && money && money.parentElement !== screen) screen.appendChild(money);
    if (screen && window.getComputedStyle) {
      const shown = window.getComputedStyle(screen).display;
      if (shown === "grid" || shown === "flex") screen.style.display = "block";
    }
    seatPlayScreen();
    const node = document.getElementById("play-started-screen");
    if (!node) return;
    const nav = document.querySelector(".site-nav");
    const mapBox = mapEl && mapEl.hidden === false ? mapEl.getBoundingClientRect() : null;
    const navBox = nav ? nav.getBoundingClientRect() : null;
    const under = !!(mapBox && navBox && mapBox.top + 1 >= navBox.bottom && mapBox.height > 0);
    const placed = money && window.getComputedStyle ? window.getComputedStyle(money).position : "";
    node.dataset.screen = under ? "full" : "short";
    node.dataset.money = money && money.hidden === false && (placed === "fixed" || placed === "absolute") ? "corner" : "away";
    const column = screen && window.getComputedStyle ? window.getComputedStyle(screen).display : "";
    node.dataset.column = column === "grid" || column === "flex" ? "side" : "none";
  }

  async function startPlay(event) {
    if (event) event.preventDefault();
    const form = document.getElementById("play-account");
    const usernameEl = document.getElementById("play-username");
    const passwordEl = document.getElementById("play-password");
    const status = document.getElementById("play-account-status");
    if (form && typeof form.reportValidity === "function" && !form.reportValidity()) {
      if (status) status.textContent = "";
      return;
    }
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    const base = apiBase();
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    let registered;
    let registerProblem = "";
    try {
      registered = await fetch(base + "/register", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
      });
    } catch (err) {
      if (status) status.textContent = "The API did not answer.";
      return;
    }
    const registeredBody = await registered.json().catch(function () { return null; });
    if (registered && !registered.ok && registered.status !== 409) {
      registerProblem = accountProblem(registeredBody, "");
    }
    let logged;
    try {
      logged = await fetch(base + "/login", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password })
      });
    } catch (err) {
      if (status) status.textContent = registerProblem || "The API did not answer.";
      return;
    }
    const session = await logged.json().catch(function () { return null; });
    if (!logged.ok || !session || !session.access_token) {
      if (status) status.textContent = registerProblem || accountProblem(session, "Start failed.");
      return;
    }
    clearSpentForNextAccount(username);
    clearFailedForNextAccount(username);
    const clearedFeed = clearFeedForNextAccount(username);
    clearTrailForNextAccount(username);
    clearFaresForNextAccount(username);
    localStorage.setItem("hackathon-empire-token", session.access_token);
    localStorage.setItem("hackathon-empire-user", username);
    if (clearedFeed) {
      paintPlayBuy();
      noteNextFeed();
    }
    if (status) status.textContent = "";
    playSignAgain = !!(registered && registered.status === 409);
    if (playSignAgain) dropSignedChips();
    hidePlayAccount();
    keepStartedScreen();
    paintPlayStatus(null);
    pollPlay();
  }

  function noteStartedTen(feed) {
    const mapEl = document.getElementById("play-map");
    if (!mapEl) return;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    let count = 0;
    PLAY_SIGNS.forEach((sign) => {
      if (cars.some((car) => car && car.sign === sign) && playChips.has(sign)) count += 1;
    });
    mapEl.dataset.ten = String(count);
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
    playSignAgain = true;
    dropSignedChips();
    hidePlayAccount();
    keepPlayMap();
    paintPlayStatus(null);
    pollPlay();
  }

  function dropSignedChips() {
    clearPlayChips();
    playFeedEpoch += 1;
    const node = document.getElementById("play-signed-chips");
    if (!node) return;
    node.dataset.chips = playChips.size === 0 ? "gone" : "stays";
    node.dataset.feed = "waiting";
  }

  function clearBuyFailed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-buy-cleared");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.feed = "good";
  }

  function clearQuietFailed() {
    const status = document.getElementById("play-buy-status");
    if (status && status.textContent === "Buy failed.") status.textContent = "";
    const node = document.getElementById("play-quiet-failed");
    if (!node) return;
    const text = status ? status.textContent : "";
    node.dataset.failed = text === "Buy failed." ? "shows" : "clear";
    node.dataset.feed = "quiet";
  }

  function clearQuietSpent() {
    clearPlaySpent();
    const node = document.getElementById("play-quiet-spent");
    if (!node) return;
    const line = document.getElementById("play-spent");
    const text = line ? line.textContent : "";
    node.dataset.spent = text.indexOf("800000") === -1 ? "clear" : "shows";
    node.dataset.feed = "quiet";
  }

  function clearQuietFares() {
    playFares.forEach((marker) => map.removeLayer(marker));
    playFares.length = 0;
    const node = document.getElementById("play-quiet-fares");
    if (!node) return;
    node.dataset.fares = playFares.length === 0 ? "clear" : "shows";
    node.dataset.feed = "quiet";
  }

  function clearQuietChips() {
    clearPlayChips();
    const list = document.getElementById("play-taxi-list");
    const node = document.getElementById("play-quiet-chips");
    if (!node) return;
    node.dataset.chips = playChips.size === 0 ? "clear" : "shows";
    node.dataset.list = list && list.textContent === "" ? "clear" : "shows";
    node.dataset.feed = "quiet";
  }

  function clearQuietMoney() {
    const rows = document.querySelectorAll("#play-money-lines li");
    rows.forEach((row) => {
      row.textContent = "";
    });
    const node = document.getElementById("play-quiet-money");
    if (!node) return;
    let showing = false;
    rows.forEach((row) => {
      if (row.textContent) showing = true;
    });
    node.dataset.money = showing ? "shows" : "clear";
    node.dataset.feed = "quiet";
  }

  function paintQuietFeed() {
    const line = document.getElementById("play-status");
    if (line) line.textContent = "The feed is quiet.";
    keepStatusClear();
    clearQuietFailed();
    clearQuietSpent();
    clearQuietFares();
    clearQuietChips();
    clearQuietMoney();
  }

  async function pollPlay() {
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const base = apiBase();
    if (!token || !base) return;
    const path = playFeedPath();
    if (!playMayRequest(path) || path.indexOf("/v1/devices") !== -1) return;
    const epoch = playFeedEpoch;
    let res;
    try {
      res = await fetch(base + path, {
        headers: { Authorization: "Bearer " + token }
      });
    } catch (err) {
      if (epoch !== playFeedEpoch) return;
      paintQuietFeed();
      return;
    }
    if (epoch !== playFeedEpoch) return;
    if (res.status === 401) {
      localStorage.removeItem("hackathon-empire-token");
      paintPlayStatus(null);
      showPlayAccount();
      keepPlayMap();
      dropBoughtChips();
      clearFeed401Chips();
      paintPlayBuy();
      clearPlaySpent();
      noteFeed401();
      clearFeed401Fares();
      clearFeed401Failed();
      clearFeed401People();
      return;
    }
    if (!res.ok) {
      paintQuietFeed();
      return;
    }
    const data = await res.json();
    playFeed = data;
    clearBuyFailed();
    const server = Number(data.server_now);
    if (Number.isFinite(server)) playClock = { server: server, client: Date.now() / 1000 };
    clearBusToggle();
    clearOfficeGrid();
    clearPhoneList();
    clearPlaceStops();
    seatPlayLocks();
    hidePlayAccount();
    paintPlayBuy();
    paintPlayStatus(data);
    paintPlayMoney(data);
    playFed = true;
    paintPlayCars(data);
    noteStartedTen(data);
    paintPlayTrails(data);
    paintPlayFares(data);
    paintPlayPeople(data);
    paintPlayOsrm(data);
    if (!playMotion) playMotion = requestAnimationFrame(glidePlay);
  }

  function glidePlay() {
    playMotion = 0;
    const cars = playFeed && Array.isArray(playFeed.cars) ? playFeed.cars : [];
    const now = playNow();
    cars.forEach((car) => {
      if (!car || !car.sign) return;
      const sign = String(car.sign);
      const marker = playChips.get(sign);
      if (!marker) return;
      const place = playPlace(car, now);
      if (!place) return;
      marker.setLatLng(place);
      const item = document.querySelector('#play-taxi-list [data-sign="' + sign + '"]');
      if (!item) return;
      let text = sign + " " + place[0] + ", " + place[1];
      text += listStatus(car);
      item.textContent = text;
    });
    noteWithPassenger();
    noteToPassenger();
    noteCarJob();
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
    let text = who ? who + ". " + fleet : fleet;
    if (feed && feed.osrm_unavailable === true) text += " OSRM unavailable";
    line.textContent = text;
    hideCompanyTotals();
    keepStatusClear();
  }

  function paintPlayOsrm(feed) {
    const line = document.getElementById("play-osrm");
    if (!line) return;
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const missing = (feed && feed.osrm_unavailable === true) || cars.some((car) => car && car.osrm === false);
    line.textContent = missing ? "OSRM unavailable" : "";
  }

  function hideCompanyTotals() {
    ["2860", "1130", "1240"].forEach((bad) => {
      document.querySelectorAll("#play-money-lines li, #play-status").forEach((node) => {
        if (!node || node.textContent.indexOf(bad) === -1) return;
        node.textContent = node.textContent.split(bad).join("").replace(/\s{2,}/g, " ").trim();
      });
    });
  }

  function shownPence(value) {
    const pence = Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
    if (pence === 2860 || pence === 1130 || pence === 1240 || pence === -1120) return "";
    return String(pence);
  }

  function feedHasCash(feed) {
    return !!(feed && Object.prototype.hasOwnProperty.call(feed, "cash_pence") && Number.isFinite(Number(feed.cash_pence)));
  }

  function cashPenceAmount(feed) {
    if (!feedHasCash(feed)) return "";
    return shownPence(feed.cash_pence);
  }

  function noteCashPence(feed) {
    const node = document.getElementById("play-cash-pence");
    const row = document.querySelector('[data-money="cash_pence"]');
    if (row) row.dataset.place = "corner";
    if (!node) return;
    node.dataset.cash = feedHasCash(feed) ? "pence" : "waiting";
    node.dataset.amount = cashPenceAmount(feed);
  }

  function fareInAmount(value) {
    const amount = shownPence(value);
    if (amount === "800000") return "";
    return amount;
  }

  function driverShareAmount(value) {
    const amount = shownPence(value);
    if (amount === "400000") return "";
    return amount;
  }

  function noteDriverShare() {
    const row = document.querySelector('[data-money="driver_share"]');
    const note = document.getElementById("play-driver-share");
    if (!note) return;
    note.dataset.share = row && row.textContent.indexOf("400000") !== -1 ? "shows" : "clear";
  }

  function noteFareIn() {
    const row = document.querySelector('[data-money="fare_in"]');
    const note = document.getElementById("play-fare-in");
    if (!note) return;
    note.dataset.fare = row && row.textContent.indexOf("800000") !== -1 ? "shows" : "clear";
  }

  function paintPlayMoney(feed) {
    ["fare_in", "driver_share", "fuel", "standing", "new_car", "cash_pence"].forEach((key) => {
      const row = document.querySelector('[data-money="' + key + '"]');
      if (!row) return;
      const amount = key === "fare_in" ? fareInAmount(feed && feed[key]) : key === "driver_share" ? driverShareAmount(feed && feed[key]) : key === "cash_pence" ? cashPenceAmount(feed) : shownPence(feed && feed[key]);
      row.textContent = (amount === "" ? key : key + " " + amount) + " pence";
    });
    hideCompanyTotals();
    noteFareIn();
    noteDriverShare();
    noteCashPence(feed);
    const money = document.getElementById("play-money");
    if (money) money.dataset.follows = "feed";
    keepPlayMoney();
  }

  const playAccount = document.getElementById("play-account");
  if (playAccount) playAccount.addEventListener("submit", startPlay);
  const playStart = document.getElementById("play-start");
  if (playStart) playStart.addEventListener("click", startPlay);
  const playCreate = document.getElementById("play-create");
  if (playCreate) playCreate.addEventListener("click", createPlayAccount);
  const playSignOut = document.getElementById("play-signout");
  if (playSignOut) playSignOut.addEventListener("click", signOutPlay);
  if (!(localStorage.getItem("hackathon-empire-token") || "")) showPlayAccount();
  paintPlayBuy();
  const playBuy = document.getElementById("play-buy");
  if (playBuy) playBuy.addEventListener("click", buyPlayCar);
  paintPlayStatus(null);
  clearStandInTaxis();
  setInterval(pollPlay, 2000);
  pollPlay();
})();
