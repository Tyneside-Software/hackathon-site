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

  function chipFill(car) {
    const fromFeed = car && typeof car.colour === "string" ? car.colour.trim() : "";
    if (/^#[0-9a-fA-F]{6}$/.test(fromFeed)) return fromFeed;
    return FEED_COLOURS[car.sign] || "#94a3b8";
  }

  function chipIcon(sign, fill) {
    const html = '<span class="play-chip" style="display:flex;align-items:center;justify-content:center;width:36px;height:22px;border-radius:6px;background:' + fill + ';color:#0c1219;font:700 11px/1 system-ui,sans-serif">' + sign + "</span>";
    return L.divIcon({ className: "play-chip-icon", html: html, iconSize: [36, 22], iconAnchor: [18, 11] });
  }

  function apiBase() {
    return String(window.HACKATHON_API || "").replace(/\/$/, "");
  }

  function paintPlayCars(feed) {
    const cars = feed && Array.isArray(feed.cars) ? feed.cars : [];
    const seen = new Set();
    const list = document.getElementById("play-taxi-list");
    if (list) list.textContent = "";
    PLAY_SIGNS.forEach((sign) => {
      const car = cars.find((row) => row && row.sign === sign);
      if (!car) return;
      const lat = Number(car.lat);
      const lng = Number(car.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      seen.add(sign);
      const fill = chipFill(car);
      let marker = playChips.get(sign);
      if (!marker) {
        marker = L.marker([lat, lng], {
          icon: chipIcon(sign, fill),
          title: sign
        }).addTo(map);
        marker._playFill = fill;
        playChips.set(sign, marker);
      } else {
        marker.setLatLng([lat, lng]);
        if (marker._playFill !== fill) {
          marker.setIcon(chipIcon(sign, fill));
          marker._playFill = fill;
        }
      }
      if (list) {
        const item = document.createElement("li");
        item.textContent = sign;
        list.appendChild(item);
      }
    });
    playChips.forEach((marker, sign) => {
      if (seen.has(sign)) return;
      map.removeLayer(marker);
      playChips.delete(sign);
    });
  }

  async function pollPlay() {
    const token = localStorage.getItem("hackathon-empire-token") || "";
    const base = apiBase();
    if (!token || !base) return;
    const res = await fetch(base + "/v1/empire", {
      headers: { Authorization: "Bearer " + token }
    });
    if (!res.ok) return;
    const data = await res.json();
    paintPlayCars(data);
    paintPlayMoney(data);
    paintPlayOsrm(data);
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
    if (pence === 2860 || pence === 1130 || pence === 1240) return "";
    return String(pence);
  }

  function paintPlayMoney(feed) {
    ["fare_in", "driver_share", "fuel", "standing"].forEach((key) => {
      const row = document.querySelector('[data-money="' + key + '"]');
      if (!row) return;
      row.textContent = key + " " + shownPence(feed && feed[key]);
    });
  }

  setInterval(pollPlay, 2000);
  pollPlay();
})();
