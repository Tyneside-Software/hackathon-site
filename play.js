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
  const playChips = new Map();

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
      const html = '<span class="play-chip" style="display:flex;align-items:center;justify-content:center;width:36px;height:22px;border-radius:6px;background:#94a3b8;color:#0c1219;font:700 11px/1 system-ui,sans-serif">' + sign + "</span>";
      let marker = playChips.get(sign);
      if (!marker) {
        marker = L.marker([lat, lng], {
          icon: L.divIcon({ className: "play-chip-icon", html: html, iconSize: [36, 22], iconAnchor: [18, 11] }),
          title: sign
        }).addTo(map);
        playChips.set(sign, marker);
      } else {
        marker.setLatLng([lat, lng]);
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
    paintPlayCars(await res.json());
  }

  setInterval(pollPlay, 2000);
  pollPlay();
})();
