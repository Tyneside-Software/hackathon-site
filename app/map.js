(() => {
  const NEWCASTLE = [54.9783, -1.6178];
  const OSRM = "https://router.project-osrm.org/route/v1/driving/";
  const ROUTE_COLOR = "#00BFFF";
  const ROUTE_OUTLINE = "#054a9e";

  const statusEl = document.getElementById("status");
  const stopsEl = document.getElementById("stops");
  const statsEl = document.getElementById("stats");
  const statStops = document.getElementById("stat-stops");
  const statKm = document.getElementById("stat-km");
  const statTime = document.getElementById("stat-time");
  const statEngine = document.getElementById("stat-engine");

  const map = L.map("map").setView(NEWCASTLE, 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);

  const markers = [];
  let routeLine = null;

  function setStatus(msg) {
    statusEl.textContent = msg;
  }

  function latlngs() {
    return markers.map((m) => m.getLatLng());
  }

  function renderStops() {
    stopsEl.innerHTML = "";
    latlngs().forEach((ll, i) => {
      const li = document.createElement("li");
      li.innerHTML = `Stop ${i + 1} · ${ll.lat.toFixed(4)}, ${ll.lng.toFixed(4)} `;
      const rm = document.createElement("button");
      rm.type = "button";
      rm.textContent = "remove";
      rm.addEventListener("click", () => {
        map.removeLayer(markers[i]);
        markers.splice(i, 1);
        renderStops();
        clearRoute();
      });
      li.appendChild(rm);
      stopsEl.appendChild(li);
    });
    statStops.textContent = String(markers.length);
    statsEl.hidden = markers.length === 0;
  }

  function clearRoute() {
    if (routeLine) {
      map.removeLayer(routeLine);
      routeLine = null;
    }
    statKm.textContent = "—";
    statTime.textContent = "—";
    statEngine.textContent = "—";
  }

  function samePoint(a, b) {
    return Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
  }

  function endAtLastCheckpoint(coords, last) {
    const end = [last.lat, last.lng];
    if (!coords.length) return [end];
    const tail = coords[coords.length - 1];
    if (samePoint(tail, end)) return coords;
    return coords.concat([end]);
  }

  function drawLine(latlngList, color) {
    if (routeLine) map.removeLayer(routeLine);
    const lineOpts = { lineJoin: "round", lineCap: "round" };
    routeLine = L.layerGroup([
      L.polyline(latlngList, { ...lineOpts, color: ROUTE_OUTLINE, weight: 9, opacity: 0.9 }),
      L.polyline(latlngList, { ...lineOpts, color, weight: 5, opacity: 1 }),
    ]).addTo(map);
    map.fitBounds(L.latLngBounds(latlngList).pad(0.12));
  }

  function haversineKm(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }

  function straightFallback() {
    const pts = latlngs();
    let km = 0;
    for (let i = 1; i < pts.length; i++) km += haversineKm(pts[i - 1], pts[i]);
    drawLine(pts, ROUTE_COLOR);
    statKm.textContent = km.toFixed(1) + " km";
    statTime.textContent = Math.round((km / 35) * 60) + " min est.";
    statEngine.textContent = "straight-line";
    setStatus("OSRM unreachable — showing straight lines so the map still works.");
  }

  async function calculate() {
    const pts = latlngs();
    if (pts.length < 2) {
      setStatus("Need at least two waypoints.");
      return;
    }
    setStatus("Calculating…");
    const path = pts.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(";");
    const url = `${OSRM}${path}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const route = data.routes && data.routes[0];
      if (!route) throw new Error("no route");
      const coords = endAtLastCheckpoint(
        route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        pts[pts.length - 1]
      );
      drawLine(coords, ROUTE_COLOR);
      statKm.textContent = (route.distance / 1000).toFixed(1) + " km";
      statTime.textContent = Math.round(route.duration / 60) + " min";
      statEngine.textContent = "OSRM driving";
      setStatus("Route ready.");
    } catch (err) {
      straightFallback();
    }
  }

  map.on("click", (e) => {
    const n = markers.length + 1;
    const marker = L.marker(e.latlng, { draggable: true, title: "Stop " + n }).addTo(map);
    marker.on("dragend", () => {
      renderStops();
      clearRoute();
    });
    markers.push(marker);
    renderStops();
    clearRoute();
    setStatus(markers.length < 2 ? "Add another stop, then calculate." : "Ready to calculate.");
  });

  document.getElementById("btn-route").addEventListener("click", calculate);
  document.getElementById("btn-clear").addEventListener("click", () => {
    markers.forEach((m) => map.removeLayer(m));
    markers.length = 0;
    clearRoute();
    renderStops();
    setStatus("Cleared. Click the map to add a stop.");
  });

  renderStops();
})();
