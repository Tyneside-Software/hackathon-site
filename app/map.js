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
  map.createPane("phones");
  map.getPane("phones").style.zIndex = 560;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap. Bus positions from <a href="https://bustimes.org/data">bustimes.org</a> / BODS',
  }).addTo(map);

  const DEPOT = [55.0367, -1.5075];
  L.circle(NEWCASTLE, {
    radius: 80467,
    color: "#054a9e",
    weight: 2,
    fillColor: "#00BFFF",
    fillOpacity: 0.08,
    interactive: false,
  }).addTo(map);
  const depotMarker = L.marker(DEPOT, { title: "Shiremoor depot" })
    .bindTooltip("Shiremoor depot", { permanent: true, direction: "top" })
    .addTo(map);
  depotMarker.on("click", (ev) => {
    if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent);
  });
  const sampleMarker = L.circleMarker(DEPOT, {
    radius: 8,
    color: "#8a5a00",
    weight: 2,
    fillColor: "#f5b942",
    fillOpacity: 0.95,
  }).addTo(map);
  sampleMarker.bindTooltip("Sample car", { permanent: true, direction: "right" });
  sampleMarker.on("click", (ev) => {
    if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent);
  });
  function gamePin(latlng, label, fill) {
    const pin = L.circleMarker(latlng, {
      radius: 7,
      color: "#054a9e",
      weight: 2,
      fillColor: fill,
      fillOpacity: 0.9,
    }).addTo(map);
    pin.bindTooltip(label, { permanent: true, direction: "left" });
    pin.on("click", (ev) => {
      if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent);
    });
    return pin;
  }
  gamePin(NEWCASTLE, "Sample pickup", "#7ec8ff");
  gamePin(DEPOT, "Sample drop-off", "#b7f0c2");
  const DURHAM = [54.7753, -1.5849];
  gamePin(DURHAM, "Durham customer", "#d9c2ff");
  let sampleRoute = null;
  let sampleMotion = 0;
  const MILE_KM = 80.467 / 50;

  function drawSample(latlngList) {
    if (sampleRoute) map.removeLayer(sampleRoute);
    const lineOpts = { lineJoin: "round", lineCap: "round" };
    sampleRoute = L.layerGroup([
      L.polyline(latlngList, { ...lineOpts, color: ROUTE_OUTLINE, weight: 9, opacity: 0.9 }),
      L.polyline(latlngList, { ...lineOpts, color: ROUTE_COLOR, weight: 5, opacity: 1 }),
    ]).addTo(map);
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
      if (distances[j] >= target) {
        const span = distances[j] - distances[j - 1];
        const step = span === 0 ? 0 : (target - distances[j - 1]) / span;
        const start = points[j - 1];
        const end = points[j];
        return [start[0] + (end[0] - start[0]) * step, start[1] + (end[1] - start[1]) * step];
      }
    }
    return points[points.length - 1];
  }

  function fallbackDuration(points) {
    let km = 0;
    for (let i = 1; i < points.length; i++) {
      km += haversineKm(
        { lat: points[i - 1][0], lng: points[i - 1][1] },
        { lat: points[i][0], lng: points[i][1] }
      );
    }
    return (km / MILE_KM) * 3600 / 30;
  }

  function moveSample(points, durationS, onDone) {
    if (sampleMotion) cancelAnimationFrame(sampleMotion);
    const started = Date.now();
    const duration = durationS > 0 ? durationS : fallbackDuration(points);
    function frame() {
      const elapsed = (Date.now() - started) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      const place = placeOnRoute(points, duration, Math.min(elapsed, duration));
      sampleMarker.setLatLng(place);
      const tip = sampleMarker.getTooltip();
      const text = Math.ceil(remaining) + " seconds remaining";
      if (tip) tip.setContent(text);
      else sampleMarker.bindTooltip(text, { permanent: true, direction: "right" });
      if (elapsed < duration) sampleMotion = requestAnimationFrame(frame);
      else {
        sampleMotion = 0;
        if (onDone) onDone();
      }
    }
    frame();
  }

  async function followPath(path, onDone) {
    const joined = path.map((p) => `${p[1].toFixed(6)},${p[0].toFixed(6)}`).join(";");
    const url = `${OSRM}${joined}?overview=full&geometries=geojson`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const route = data.routes && data.routes[0];
      if (!route) throw new Error("no route");
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      drawSample(coords);
      moveSample(coords, route.duration, onDone);
      return true;
    } catch (err) {
      drawSample(path);
      moveSample(path, fallbackDuration(path), onDone);
      return false;
    }
  }

  async function driveSample(dest, doneText) {
    const path = [DEPOT, dest, DEPOT];
    const joined = path.map((p) => `${p[1].toFixed(6)},${p[0].toFixed(6)}`).join(";");
    const url = `${OSRM}${joined}?overview=full&geometries=geojson`;
    const sampleStatus = document.getElementById("sample-status");
    if (sampleStatus) sampleStatus.textContent = "Asking OSRM…";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const route = data.routes && data.routes[0];
      if (!route) throw new Error("no route");
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      drawSample(coords);
      moveSample(coords, route.duration);
      if (sampleStatus) sampleStatus.textContent = doneText;
    } catch (err) {
      drawSample(path);
      moveSample(path, fallbackDuration(path));
      if (sampleStatus) sampleStatus.textContent = "OSRM unavailable";
    }
  }

  const btnSample = document.getElementById("btn-sample");
  if (btnSample) {
    btnSample.addEventListener("click", () => driveSample(NEWCASTLE, "Sample car drove to Grey's Monument and back."));
    if (btnSample.parentElement) {
      const durhamButton = document.createElement("button");
      durhamButton.type = "button";
      durhamButton.className = "btn btn-ghost";
      durhamButton.textContent = "Drive to the Durham customer and back";
      durhamButton.addEventListener("click", () => driveSample(DURHAM, "Sample car drove to the Durham customer and back."));
      btnSample.parentElement.appendChild(durhamButton);
    }
  }
  ["at_depot", "offered", "accepted", "started", "returning"].forEach((status) => {
    if (!btnSample || !btnSample.parentElement) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-ghost";
    button.textContent = status;
    button.addEventListener("click", () => {
      sampleMarker.unbindTooltip();
      sampleMarker.bindTooltip("Sample car " + status, { permanent: true, direction: "right" });
    });
    btnSample.parentElement.appendChild(button);
  });

  const EARTH_KM = 6371;
  const customerPins = [];

  function destinationPoint(origin, bearingDeg, miles) {
    const km = miles * MILE_KM;
    const lat1 = origin[0] * Math.PI / 180;
    const lng1 = origin[1] * Math.PI / 180;
    const bearing = (bearingDeg % 360) * Math.PI / 180;
    const ang = km / EARTH_KM;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(ang) + Math.cos(lat1) * Math.sin(ang) * Math.cos(bearing)
    );
    const lng2 = lng1 + Math.atan2(
      Math.sin(bearing) * Math.sin(ang) * Math.cos(lat1),
      Math.cos(ang) - Math.sin(lat1) * Math.sin(lat2)
    );
    const lng = (lng2 * 180 / Math.PI + 540) % 360 - 180;
    return [lat2 * 180 / Math.PI, lng];
  }

  function addCustomerPin(latlng) {
    const pin = L.circleMarker(latlng, {
      radius: 6,
      color: "#6b21a8",
      weight: 2,
      fillColor: "#e9d5ff",
      fillOpacity: 0.95,
    }).addTo(map);
    pin.bindTooltip("Customer · not a device", { permanent: true, direction: "bottom" });
    pin.on("click", (ev) => {
      if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent);
    });
    customerPins.push(pin);
  }

  addCustomerPin(DEPOT);

  function markDepot() {
    sampleMarker.setLatLng(DEPOT);
    const tip = sampleMarker.getTooltip();
    if (tip) tip.setContent("at_depot");
    else sampleMarker.bindTooltip("at_depot", { permanent: true, direction: "right" });
    const sampleStatus = document.getElementById("sample-status");
    if (sampleStatus) sampleStatus.textContent = "at_depot";
  }

  async function driveHome(origin) {
    const sampleStatus = document.getElementById("sample-status");
    const tip = sampleMarker.getTooltip();
    if (tip) tip.setContent("returning");
    if (sampleStatus) sampleStatus.textContent = "returning";
    const osrm = await followPath([origin, DEPOT], markDepot);
    if (!osrm && sampleStatus && sampleStatus.textContent !== "at_depot") {
      sampleStatus.textContent = "OSRM unavailable";
    }
  }

  async function startOfferCar(dest) {
    if (customerPins.length) map.removeLayer(customerPins.shift());
    const sampleStatus = document.getElementById("sample-status");
    if (sampleStatus) sampleStatus.textContent = "Asking OSRM…";
    const osrm = await followPath([DEPOT, dest], () => driveHome(dest));
    if (sampleStatus && sampleStatus.textContent === "Asking OSRM…") {
      sampleStatus.textContent = osrm ? "T1 started. The customer pin is gone." : "OSRM unavailable";
    }
  }

  if (btnSample && btnSample.parentElement) {
    const acceptPin = document.createElement("button");
    acceptPin.type = "button";
    acceptPin.className = "btn btn-ghost";
    acceptPin.textContent = "Accept the customer pin";
    acceptPin.addEventListener("click", () => startOfferCar(destinationPoint(DEPOT, 90, 2)));
    btnSample.parentElement.appendChild(acceptPin);
  }

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
    const t = e.originalEvent && e.originalEvent.target;
    if (t && t.closest && t.closest(".bus-marker, .bus-chip-wrap, .bus-chip, .bus-dot, .taxi-marker, .taxi-chip, .leaflet-popup")) return;
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

  const DEVICE_COLOUR = "#F5A623";
  const HISTORY_COLOUR = "#34d399";
  const HISTORY_OUTLINE = "#065f46";
  const FRESH_MS = 2 * 60 * 1000;
  const PHONE_ZOOM = 16;
  const SAME_PLACE = 1e-6;
  const deviceMarkers = new Map();
  const devicesEl = document.getElementById("devices");
  const deviceStatusEl = document.getElementById("device-status");
  const drawerEl = document.getElementById("phone-drawer");
  const drawerTitleEl = document.getElementById("drawer-title");
  const drawerStatusEl = document.getElementById("drawer-status");
  const pingListEl = document.getElementById("ping-list");
  const btnHistory = document.getElementById("btn-history");
  const btnDrawerClose = document.getElementById("drawer-close");
  const btnPhones = document.getElementById("btn-phones");
  const PHONES_KEY = "hackathon-map-phones";

  function readPhonesPref() {
    try {
      const v = localStorage.getItem(PHONES_KEY);
      if (v === "0") return false;
      if (v === "1") return true;
    } catch (err) {
      /* private mode */
    }
    return true;
  }

  function writePhonesPref(on) {
    try {
      localStorage.setItem(PHONES_KEY, on ? "1" : "0");
    } catch (err) {
      /* private mode */
    }
  }

  let phonesOn = readPhonesPref();
  let fittedPhones = false;
  let selectedDeviceId = null;
  let historyStamp = null;
  let historyPings = [];
  let historyLayer = null;
  let historyOnMap = false;

  function apiBase() {
    return String(window.HACKATHON_API || "").replace(/\/$/, "");
  }

  function shortId(id) {
    const s = String(id || "");
    if (s.startsWith("android-") && s.length > 16) return s.slice(0, 16) + "…";
    if (s.length > 18) return s.slice(0, 18) + "…";
    return s || "phone";
  }

  function phoneLabel(d) {
    const nick = d && typeof d.nickname === "string" ? d.nickname.trim() : "";
    if (nick) return nick;
    return shortId(d && d.device_id);
  }

  function ageLabel(iso) {
    if (!iso) return "";
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return iso;
    const sec = Math.max(0, Math.round((Date.now() - t) / 1000));
    if (sec < 45) return "just now";
    if (sec < 120) return "1 min ago";
    if (sec < 3600) return Math.round(sec / 60) + " min ago";
    return Math.round(sec / 3600) + " h ago";
  }

  function isFresh(iso) {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return false;
    return Date.now() - t < FRESH_MS;
  }

  function samePlace(a, b) {
    return Math.abs(a.lat - b.lat) < SAME_PLACE && Math.abs(a.lng - b.lng) < SAME_PLACE;
  }

  function uniquePings(pings) {
    const ordered = (pings || [])
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number")
      .slice()
      .sort((a, b) => String(a.recorded_at || "").localeCompare(String(b.recorded_at || "")));
    const out = [];
    ordered.forEach((p) => {
      const prev = out[out.length - 1];
      if (prev && samePlace(prev, p)) return;
      out.push(p);
    });
    return out;
  }

  function zoomToPhone(lat, lng, deviceId) {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) map.setView([lat, lng], PHONE_ZOOM);
    else map.flyTo([lat, lng], PHONE_ZOOM, { duration: 0.7 });
    const marker = deviceMarkers.get(deviceId);
    if (marker) marker.openPopup();
  }

  function setHistoryButton() {
    if (!btnHistory) return;
    btnHistory.textContent = historyOnMap ? "Hide history" : "Show history on map";
    btnHistory.className = "btn " + (historyOnMap ? "btn-ghost" : "btn-fill");
    btnHistory.disabled = !historyPings.length;
  }

  function clearHistoryLayer() {
    if (historyLayer) {
      map.removeLayer(historyLayer);
      historyLayer = null;
    }
    historyOnMap = false;
    setHistoryButton();
  }

  function plotHistoryOnMap(fit) {
    clearHistoryLayer();
    const path = uniquePings(historyPings);
    const pts = path.map((p) => [p.lat, p.lng]);
    if (!pts.length) return;
    const layers = [];
    if (pts.length >= 2) {
      const lineOpts = { lineJoin: "round", lineCap: "round" };
      layers.push(
        L.polyline(pts, { ...lineOpts, color: HISTORY_OUTLINE, weight: 8, opacity: 0.9 })
      );
      layers.push(L.polyline(pts, { ...lineOpts, color: HISTORY_COLOUR, weight: 4, opacity: 1 }));
    }
    path.forEach((p, i) => {
      const last = i === path.length - 1;
      layers.push(
        L.circleMarker([p.lat, p.lng], {
          radius: last ? 8 : 5,
          color: "#0B1220",
          weight: 2,
          fillColor: last ? HISTORY_COLOUR : "#fbbf24",
          fillOpacity: 0.95,
        }).bindPopup(
          "<strong>" +
            (i + 1) +
            " / " +
            path.length +
            "</strong><br>" +
            p.lat.toFixed(5) +
            ", " +
            p.lng.toFixed(5) +
            "<br>" +
            (ageLabel(p.recorded_at) || "")
        )
      );
    });
    historyLayer = L.layerGroup(layers).addTo(map);
    historyOnMap = true;
    setHistoryButton();
    if (fit !== false) map.fitBounds(L.latLngBounds(pts).pad(0.18));
  }

  function renderPingList() {
    if (!pingListEl) return;
    pingListEl.innerHTML = "";
    historyPings
      .slice()
      .reverse()
      .forEach((p) => {
        const li = document.createElement("li");
        li.className = "ping-item";
        const coords = document.createElement("div");
        coords.className = "ping-item-coords";
        coords.textContent = p.lat.toFixed(5) + ", " + p.lng.toFixed(5);
        const age = document.createElement("div");
        age.className = "ping-item-age";
        age.textContent =
          (p.recorded_at ? String(p.recorded_at).replace("T", " ").replace("Z", " UTC") : "unknown time") +
          (ageLabel(p.recorded_at) ? " · " + ageLabel(p.recorded_at) : "");
        li.appendChild(coords);
        li.appendChild(age);
        pingListEl.appendChild(li);
      });
  }

  function openDrawer(deviceId) {
    if (!drawerEl) return;
    if (drawerTitleEl) drawerTitleEl.textContent = deviceId || "phone";
    drawerEl.classList.add("is-open");
    drawerEl.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    selectedDeviceId = null;
    historyStamp = null;
    historyPings = [];
    clearHistoryLayer();
    if (drawerEl) {
      drawerEl.classList.remove("is-open");
      drawerEl.setAttribute("aria-hidden", "true");
    }
    if (pingListEl) pingListEl.innerHTML = "";
    if (drawerStatusEl) drawerStatusEl.textContent = "";
    if (drawerTitleEl) drawerTitleEl.textContent = "—";
    markSelected();
    setHistoryButton();
  }

  function markSelected() {
    if (!devicesEl) return;
    devicesEl.querySelectorAll(".phone-card").forEach((btn) => {
      const on = btn.getAttribute("data-device-id") === selectedDeviceId;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  async function loadHistory(deviceId, quiet) {
    const base = apiBase();
    if (!base || !deviceId) return;
    if (!quiet && drawerStatusEl) drawerStatusEl.textContent = "Loading history…";
    try {
      const res = await fetch(
        base + "/v1/locations?device_id=" + encodeURIComponent(deviceId) + "&limit=500",
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (selectedDeviceId !== deviceId) return;
      const raw = data.pings || [];
      historyPings = uniquePings(raw);
      renderPingList();
      if (drawerStatusEl) {
        if (!historyPings.length) drawerStatusEl.textContent = "No pings in LocationPing for this device.";
        else
          drawerStatusEl.textContent =
            historyPings.length +
            " location" +
            (historyPings.length === 1 ? "" : "s") +
            " (same-place updates hidden).";
      }
      setHistoryButton();
      if (historyOnMap) plotHistoryOnMap(false);
    } catch (err) {
      if (selectedDeviceId !== deviceId) return;
      historyPings = [];
      renderPingList();
      if (drawerStatusEl) drawerStatusEl.textContent = "Could not load ping history.";
      setHistoryButton();
    }
  }

  function selectDevice(d) {
    const switching = selectedDeviceId !== d.device_id;
    selectedDeviceId = d.device_id;
    markSelected();
    openDrawer(phoneLabel(d));
    paintOnePhone(d);
    zoomToPhone(d.last_lat, d.last_lng, d.device_id);
    if (switching) {
      historyPings = [];
      clearHistoryLayer();
      if (pingListEl) pingListEl.innerHTML = "";
    }
    historyStamp = d.last_seen_at || null;
    loadHistory(d.device_id);
  }

  function renderDevices(rows) {
    if (!devicesEl) return;
    devicesEl.innerHTML = "";
    rows.forEach((d) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      const fresh = isFresh(d.last_seen_at);
      const label = phoneLabel(d);
      const age = ageLabel(d.last_seen_at) || "no ping time";
      btn.type = "button";
      btn.className = "phone-card " + (fresh ? "is-fresh" : "is-stale");
      btn.setAttribute("data-device-id", d.device_id);
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute(
        "aria-label",
        "Open " + label + ", last seen " + age + (fresh ? ", live" : ", stale")
      );
      const idEl = document.createElement("span");
      idEl.className = "phone-card-id";
      idEl.textContent = label;
      const ageEl = document.createElement("span");
      ageEl.className = "phone-card-age";
      ageEl.textContent = age;
      btn.appendChild(idEl);
      btn.appendChild(ageEl);
      btn.addEventListener("click", () => selectDevice(d));
      li.appendChild(btn);
      devicesEl.appendChild(li);
    });
    markSelected();
  }

  function clearPhoneMarkers() {
    deviceMarkers.forEach((marker) => map.removeLayer(marker));
    deviceMarkers.clear();
  }

  function syncPhonesButton() {
    if (!btnPhones) return;
    btnPhones.textContent = phonesOn ? "Hide phones" : "Show phones";
    btnPhones.setAttribute("aria-pressed", phonesOn ? "true" : "false");
    btnPhones.classList.toggle("is-on", phonesOn);
    btnPhones.classList.toggle("btn-fill", phonesOn);
    btnPhones.classList.toggle("btn-ghost", !phonesOn);
  }

  function paintOnePhone(d) {
    const lat = Number(d.last_lat);
    const lng = Number(d.last_lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const latlng = [lat, lng];
    let marker = deviceMarkers.get(d.device_id);
    const html =
      "<strong>" +
      phoneLabel(d) +
      "</strong><br>" +
      lat.toFixed(5) +
      ", " +
      lng.toFixed(5) +
      "<br>" +
      ageLabel(d.last_seen_at);
    if (!marker) {
      marker = L.circleMarker(latlng, {
        pane: "phones",
        radius: 11,
        color: "#0B1220",
        weight: 3,
        fillColor: DEVICE_COLOUR,
        fillOpacity: 1,
      }).addTo(map);
      deviceMarkers.set(d.device_id, marker);
    } else {
      marker.setLatLng(latlng);
    }
    marker.bindPopup(html);
  }

  function paintPhoneMarkers(rows) {
    if (!phonesOn) {
      clearPhoneMarkers();
      if (selectedDeviceId) {
        const selected = rows.find((d) => d.device_id === selectedDeviceId);
        if (selected) paintOnePhone(selected);
      }
      return;
    }
    const seen = new Set();
    rows.forEach((d) => {
      seen.add(d.device_id);
      paintOnePhone(d);
    });
    Array.from(deviceMarkers.keys()).forEach((id) => {
      if (!seen.has(id)) {
        map.removeLayer(deviceMarkers.get(id));
        deviceMarkers.delete(id);
      }
    });
    if (!fittedPhones && rows.length) {
      const pts = rows
        .map((d) => [Number(d.last_lat), Number(d.last_lng)])
        .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
      if (pts.length) {
        const bounds = L.latLngBounds(pts);
        if (pts.length === 1 || !map.getBounds().intersects(bounds)) {
          map.fitBounds(bounds.pad(pts.length === 1 ? 0.4 : 0.25));
        }
        fittedPhones = true;
      }
    }
  }

  function setPhonesOn(on) {
    phonesOn = !!on;
    writePhonesPref(phonesOn);
    syncPhonesButton();
    if (!phonesOn) {
      clearPhoneMarkers();
      clearHistoryLayer();
      if (deviceStatusEl) {
        const n = devicesEl ? devicesEl.querySelectorAll(".phone-card").length : 0;
        deviceStatusEl.textContent = n
          ? n + " phone" + (n === 1 ? "" : "s") + " hidden on the map."
          : "Phones hidden.";
      }
    } else {
      refreshDevices();
    }
  }

  async function refreshDevices() {
    const base = apiBase();
    if (!base || !deviceStatusEl) return;
    try {
      const res = await fetch(base + "/v1/devices", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const rows = (data.devices || [])
        .map((d) => ({
          ...d,
          last_lat: Number(d.last_lat),
          last_lng: Number(d.last_lng),
        }))
        .filter((d) => Number.isFinite(d.last_lat) && Number.isFinite(d.last_lng));
      paintPhoneMarkers(rows);
      renderDevices(rows);
      if (!phonesOn) {
        deviceStatusEl.textContent = rows.length
          ? rows.length + " phone" + (rows.length === 1 ? "" : "s") + " hidden on the map."
          : "Phones hidden.";
      } else {
        deviceStatusEl.textContent = rows.length
          ? rows.length + " phone" + (rows.length === 1 ? "" : "s") + " on the map."
          : "No phones pinging yet. Flip the tracker on.";
      }
      if (selectedDeviceId) {
        const still = rows.find((d) => d.device_id === selectedDeviceId);
        if (!still) closeDrawer();
        else if ((still.last_seen_at || null) !== historyStamp) {
          historyStamp = still.last_seen_at || null;
          loadHistory(selectedDeviceId, true);
        }
      }
    } catch (err) {
      deviceStatusEl.textContent = "Could not read phones from the API.";
    }
  }

  if (btnHistory) {
    btnHistory.addEventListener("click", () => {
      if (historyOnMap) clearHistoryLayer();
      else plotHistoryOnMap();
    });
  }
  if (btnDrawerClose) btnDrawerClose.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && selectedDeviceId) closeDrawer();
  });
  setHistoryButton();
  syncPhonesButton();
  if (btnPhones) btnPhones.addEventListener("click", () => setPhonesOn(!phonesOn));

  // Live buses — GET /v1/buses (Firestore cache; API fetches bustimes.org).
  // Off by default. Poll our API only while the toggle is on.
  const BUS_MILES = 30;
  const BUS_KM = BUS_MILES * 1.609344;
  const BUS_POLL_MS = 15000;
  const BUS_STALE_MS = 10 * 60 * 1000;
  const BUS_CHIP_ZOOM = 14;
  const BUS_TRAIL_S = 10 * 60;

  map.createPane("bus-trails");
  map.getPane("bus-trails").style.zIndex = 440;
  map.getPane("bus-trails").style.pointerEvents = "none";
  map.createPane("buses");
  map.getPane("buses").style.zIndex = 450;
  const trailRenderer = L.canvas({ padding: 0.45, pane: "bus-trails" });
  const trailLayers = new Map();

  const btnBuses = document.getElementById("btn-buses");
  const busStatusEl = document.getElementById("bus-status");
  const busMarkers = new Map();
  let busesOn = false;
  let busTimer = null;
  let busAbort = null;
  let busRows = [];
  let busFeed = null;

  function setBusStatus(msg) {
    if (busStatusEl) busStatusEl.textContent = msg;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function busLine(v) {
    const line = v && v.service && v.service.line_name;
    return line ? String(line) : "";
  }

  function busColour(v) {
    const c = v && v.vehicle && (v.vehicle.colour || v.vehicle.css);
    if (c && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(c)) return c;
    return "#f59e0b";
  }

  function busTextColour(v, fill) {
    const t = v && v.vehicle && v.vehicle.text_colour;
    if (t && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(t)) return t;
    const h = fill.replace("#", "");
    const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 150 ? "#0c1219" : "#fff";
  }

  function withinNewcastle(lat, lng) {
    return haversineKm({ lat, lng }, { lat: NEWCASTLE[0], lng: NEWCASTLE[1] }) <= BUS_KM;
  }

  function busIsFresh(v) {
    const t = Date.parse(v && v.datetime);
    if (Number.isNaN(t)) return true;
    return Date.now() - t < BUS_STALE_MS;
  }

  function busMode() {
    return map.getZoom() < BUS_CHIP_ZOOM ? "dot" : "chip";
  }

  function busLook(v, mode) {
    const heading = typeof v.heading === "number" ? Math.round(v.heading / 15) * 15 : "";
    return mode + "|" + busLine(v) + "|" + busColour(v) + "|" + heading;
  }

  function busIcon(v, mode) {
    const line = escapeHtml(busLine(v) || "?");
    const fill = busColour(v);
    const text = busTextColour(v, fill);
    if (mode === "dot") {
      return L.divIcon({
        className: "bus-marker",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        popupAnchor: [0, -8],
        html: '<div class="bus-dot" style="background:' + fill + '"></div>',
      });
    }
    const hasH = typeof v.heading === "number";
    const heading = hasH ? v.heading : 0;
    return L.divIcon({
      className: "bus-marker",
      iconSize: [32, 36],
      iconAnchor: [16, 22],
      popupAnchor: [0, -20],
      html:
        '<div class="bus-chip-wrap">' +
        (hasH
          ? '<span class="bus-heading" style="transform:rotate(' +
            heading +
            'deg)"><span class="bus-nose"></span></span>'
          : "") +
        '<div class="bus-chip" style="background:' +
        fill +
        ";color:" +
        text +
        '"><span class="bus-marker-label">' +
        line +
        "</span></div></div>",
    });
  }

  function busPopup(v) {
    const line = escapeHtml(busLine(v) || "?");
    const dest = escapeHtml(v.destination || "Unknown destination");
    const name = escapeHtml((v.vehicle && v.vehicle.name) || "");
    const when = v.datetime ? escapeHtml(ageLabel(v.datetime) || v.datetime) : "";
    const href = v.service && v.service.url
      ? "https://bustimes.org" + v.service.url
      : "https://bustimes.org/map";
    return (
      "<strong>Service " +
      line +
      "</strong><br>" +
      dest +
      (name ? "<br>" + name : "") +
      (when ? "<br>" + when : "") +
      '<br><a href="' +
      href +
      '" target="_blank" rel="noopener">bustimes.org</a>'
    );
  }

  function bindBusMarker(marker, v) {
    const html = busPopup(v);
    const popup = marker.getPopup();
    if (popup) {
      if (popup.getContent() !== html) popup.setContent(html);
    } else {
      marker.bindPopup(html, { closeButton: true, autoPan: false });
    }
  }

  function clearTrails() {
    trailLayers.forEach((group) => map.removeLayer(group));
    trailLayers.clear();
  }

  function clearBuses() {
    clearTrails();
    busMarkers.forEach((entry) => map.removeLayer(entry.marker));
    busMarkers.clear();
  }

  function stopBusPoll() {
    if (busTimer) {
      clearInterval(busTimer);
      busTimer = null;
    }
    if (busAbort) {
      busAbort.abort();
      busAbort = null;
    }
  }

  function syncBusButton() {
    if (!btnBuses) return;
    btnBuses.textContent = busesOn ? "Hide buses" : "Show buses";
    btnBuses.setAttribute("aria-pressed", busesOn ? "true" : "false");
    btnBuses.classList.toggle("is-on", busesOn);
    btnBuses.classList.toggle("btn-fill", busesOn);
    btnBuses.classList.toggle("btn-ghost", !busesOn);
  }

  function upsertBuses(rows) {
    const mode = busMode();
    const bounds = map.getBounds().pad(0.06);
    const seen = new Set();
    let inCircle = 0;
    let stale = 0;
    let newest = 0;
    function noteTime(v) {
      const t = Date.parse(v && v.datetime);
      if (!Number.isNaN(t) && t > newest) newest = t;
    }
    (rows || []).forEach((v) => {
      const coords = v && v.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return;
      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      if (!withinNewcastle(lat, lng)) return;
      inCircle += 1;
      noteTime(v);
      if (!busLine(v)) return;
      if (!busIsFresh(v)) {
        stale += 1;
        return;
      }
      if (!bounds.contains([lat, lng])) return;
      const id = String(v.id != null ? v.id : lat + "," + lng);
      seen.add(id);
      const latlng = [lat, lng];
      const look = busLook(v, mode);
      let entry = busMarkers.get(id);
      if (!entry) {
        const marker = L.marker(latlng, {
          icon: busIcon(v, mode),
          title: busLine(v),
          keyboard: false,
          pane: "buses",
          riseOnHover: true,
          bubblingMouseEvents: false,
        }).addTo(map);
        bindBusMarker(marker, v);
        busMarkers.set(id, { marker, look });
      } else {
        entry.marker.setLatLng(latlng);
        if (entry.look !== look) {
          entry.marker.setIcon(busIcon(v, mode));
          entry.look = look;
        }
        bindBusMarker(entry.marker, v);
      }
    });
    Array.from(busMarkers.keys()).forEach((id) => {
      if (!seen.has(id)) {
        map.removeLayer(busMarkers.get(id).marker);
        busMarkers.delete(id);
      }
    });
    return { inView: seen.size, inCircle, stale, mode, newest };
  }

  function trailWindowS() {
    const n = busFeed && Number(busFeed.trail_s);
    return Number.isFinite(n) && n > 0 ? n : BUS_TRAIL_S;
  }

  const SNAP_MAX = 2;
  const SNAP_WAYPOINTS = 20;
  const snapCache = new Map();
  const snapPending = new Set();
  const snapQueue = [];
  let snapRunning = 0;

  function trailSig(id, pts) {
    return id + ":" + pts[0].t + ":" + pts[pts.length - 1].t + ":" + pts.length;
  }

  function downsampleTrail(pts, maxN) {
    if (pts.length <= maxN) return pts;
    const out = [pts[0]];
    const step = (pts.length - 1) / (maxN - 1);
    for (let i = 1; i < maxN - 1; i++) out.push(pts[Math.round(i * step)]);
    out.push(pts[pts.length - 1]);
    return out;
  }

  function trailInView(pts) {
    const bounds = map.getBounds().pad(0.12);
    for (let i = 0; i < pts.length; i++) {
      if (bounds.contains(pts[i].ll)) return true;
    }
    return false;
  }

  function llObj(ll) {
    return { lat: ll[0], lng: ll[1] };
  }

  function splitSnappedTrail(coords, pts) {
    if (!coords || coords.length < 2 || pts.length < 2) return [];
    let gpsTotal = 0;
    const gpsSeg = [];
    for (let i = 1; i < pts.length; i++) {
      const d = haversineKm(llObj(pts[i - 1].ll), llObj(pts[i].ll));
      gpsSeg.push(d);
      gpsTotal += d;
    }
    let snapTotal = 0;
    for (let i = 1; i < coords.length; i++) {
      snapTotal += haversineKm(llObj(coords[i - 1]), llObj(coords[i]));
    }
    if (snapTotal < 1e-6) return [];
    const pieces = [];
    let coordI = 0;
    let distAlong = 0;
    for (let g = 0; g < gpsSeg.length; g++) {
      const share = gpsTotal > 0 ? (gpsSeg[g] / gpsTotal) * snapTotal : snapTotal / gpsSeg.length;
      const target = distAlong + share;
      const latlngs = [coords[Math.min(coordI, coords.length - 1)]];
      while (coordI < coords.length - 1 && distAlong < target - 0.002) {
        distAlong += haversineKm(llObj(coords[coordI]), llObj(coords[coordI + 1]));
        coordI += 1;
        latlngs.push(coords[coordI]);
      }
      if (latlngs.length < 2 && coordI < coords.length - 1) {
        coordI += 1;
        latlngs.push(coords[coordI]);
      }
      if (latlngs.length >= 2) pieces.push({ latlngs: latlngs, t0: pts[g].t, t1: pts[g + 1].t });
    }
    return pieces;
  }

  function partsFromGps(pts, windowS, now) {
    const parts = [];
    let cur = null;
    for (let i = 1; i < pts.length; i++) {
      const age = now - (pts[i - 1].t + pts[i].t) / 2;
      const op = Math.max(0, 1 - age / windowS);
      if (op < 0.05) continue;
      const bucket = Math.round(op * 8) / 8;
      if (cur && cur.bucket === bucket) cur.latlngs.push(pts[i].ll);
      else {
        if (cur) parts.push(cur);
        cur = { bucket: bucket, opacity: bucket, latlngs: [pts[i - 1].ll, pts[i].ll] };
      }
    }
    if (cur) parts.push(cur);
    return parts;
  }

  function partsFromSnap(snap, pts, windowS, now) {
    const pieces = splitSnappedTrail(snap.coords, pts);
    if (!pieces.length) return partsFromGps(pts, windowS, now);
    const parts = [];
    pieces.forEach((piece) => {
      const age = now - (piece.t0 + piece.t1) / 2;
      const op = Math.max(0, 1 - age / windowS);
      if (op < 0.05 || piece.latlngs.length < 2) return;
      parts.push({ opacity: Math.round(op * 8) / 8, latlngs: piece.latlngs });
    });
    return parts.length ? parts : partsFromGps(pts, windowS, now);
  }

  function enqueueTrailSnap(id, pts) {
    const sampled = downsampleTrail(pts, SNAP_WAYPOINTS);
    const sig = trailSig(id, sampled);
    if (snapCache.has(sig) || snapPending.has(sig)) return;
    snapPending.add(sig);
    snapQueue.push({ id: id, pts: sampled, sig: sig });
    pumpTrailSnap();
  }

  function pumpTrailSnap() {
    while (snapRunning < SNAP_MAX && snapQueue.length) {
      const job = snapQueue.shift();
      snapRunning += 1;
      snapOneTrail(job).then(
        function () {},
        function () {}
      ).then(function () {
        snapRunning -= 1;
        pumpTrailSnap();
      });
    }
  }

  async function snapOneTrail(job) {
    const path = job.pts
      .map(function (p) {
        return p.ll[1].toFixed(5) + "," + p.ll[0].toFixed(5);
      })
      .join(";");
    const url = OSRM + path + "?overview=full&geometries=geojson";
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const route = data.routes && data.routes[0];
      if (!route || !route.geometry || !route.geometry.coordinates) throw new Error("no route");
      const coords = route.geometry.coordinates.map(function (c) {
        return [c[1], c[0]];
      });
      if (coords.length < 2) throw new Error("short");
      snapCache.set(job.sig, { coords: coords });
      if (snapCache.size > 250) {
        const first = snapCache.keys().next().value;
        snapCache.delete(first);
      }
    } catch (err) {
      snapCache.set(job.sig, { coords: job.pts.map(function (p) { return p.ll; }), straight: true });
    } finally {
      snapPending.delete(job.sig);
      if (busesOn) paintTrails();
    }
  }

  function drawTrailGroup(id, parts, colour) {
    const prev = trailLayers.get(id);
    if (prev) map.removeLayer(prev);
    if (!parts.length) {
      trailLayers.delete(id);
      return;
    }
    const group = L.layerGroup();
    parts.forEach(function (part) {
      L.polyline(part.latlngs, {
        color: colour,
        weight: 3,
        opacity: part.opacity,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
        bubblingMouseEvents: false,
        renderer: trailRenderer,
        pane: "bus-trails",
      }).addTo(group);
    });
    group.addTo(map);
    trailLayers.set(id, group);
  }

  function paintTrails() {
    const trails = (busFeed && busFeed.trails) || {};
    const windowS = trailWindowS();
    const now = Date.now() / 1000;
    const colourById = new Map();
    (busRows || []).forEach((v) => {
      if (v && v.id != null) colourById.set(String(v.id), busColour(v));
    });
    const keep = new Set();
    Object.keys(trails).forEach((id) => {
      const raw = trails[id];
      if (!Array.isArray(raw) || raw.length < 2) return;
      const pts = [];
      raw.forEach((p) => {
        if (!Array.isArray(p) || p.length < 3) return;
        const lng = Number(p[0]);
        const lat = Number(p[1]);
        const t = Number(p[2]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(t)) return;
        if (now - t > windowS) return;
        pts.push({ ll: [lat, lng], t: t });
      });
      if (pts.length < 2) return;
      if (!trailInView(pts)) return;
      const sampled = downsampleTrail(pts, SNAP_WAYPOINTS);
      const sig = trailSig(id, sampled);
      const snap = snapCache.get(sig);
      const colour = colourById.get(id) || "#f59e0b";
      const parts = snap && snap.coords
        ? partsFromSnap(snap, sampled, windowS, now)
        : partsFromGps(pts, windowS, now);
      drawTrailGroup(id, parts, colour);
      keep.add(id);
      if (!snap) enqueueTrailSnap(id, pts);
    });
    Array.from(trailLayers.keys()).forEach((id) => {
      if (!keep.has(id)) {
        map.removeLayer(trailLayers.get(id));
        trailLayers.delete(id);
      }
    });
  }

  function busCacheNote() {
    if (!busFeed) return "";
    let extra = "";
    if (busFeed.refreshed) extra += " · refreshed";
    else if (typeof busFeed.age_s === "number") extra += " · cache " + Math.round(busFeed.age_s) + "s";
    if (busFeed.stale) extra += " · stale snapshot";
    return extra;
  }

  function paintBuses() {
    if (!busesOn) return;
    const n = upsertBuses(busRows);
    if (!n.inCircle) {
      setBusStatus("No live buses in the 30-mile circle right now." + busCacheNote());
      return;
    }
    let msg = n.inView + " in view";
    if (n.mode === "dot") msg += " as dots · zoom in for line numbers";
    msg += " · " + n.inCircle + " within " + BUS_MILES + " miles";
    if (n.stale) msg += " · " + n.stale + " stale hidden";
    if (n.newest) msg += " · newest ping " + (ageLabel(new Date(n.newest).toISOString()) || "just now");
    const trails = (busFeed && busFeed.trails) || {};
    if (Object.keys(trails).length) msg += " · " + Math.round(trailWindowS() / 60) + " min trail";
    setBusStatus(msg + busCacheNote() + ".");
  }

  async function refreshBuses() {
    if (!busesOn) return;
    if (document.hidden) {
      setBusStatus("Paused while this tab is in the background.");
      return;
    }
    if (busAbort) busAbort.abort();
    busAbort = new AbortController();
    if (!busRows.length) setBusStatus("Loading buses…");
    const base = apiBase();
    if (!base) {
      setBusStatus("No API URL in config.js.");
      return;
    }
    try {
      const res = await fetch(base + "/v1/buses", {
        headers: { Accept: "application/json" },
        signal: busAbort.signal,
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!busesOn) return;
      busFeed = data && typeof data === "object" ? data : null;
      busRows = busFeed && Array.isArray(busFeed.vehicles) ? busFeed.vehicles : [];
      paintBuses();
      paintTrails();
    } catch (err) {
      if (err && err.name === "AbortError") return;
      if (!busesOn) return;
      setBusStatus("Could not reach our API for buses. Layer stays on — try again shortly.");
    }
  }

  function setBusesOn(on) {
    busesOn = !!on;
    syncBusButton();
    if (!busesOn) {
      stopBusPoll();
      clearBuses();
      busRows = [];
      busFeed = null;
      setBusStatus("Off — no data fetched.");
      return;
    }
    stopBusPoll();
    setBusStatus("Loading buses…");
    refreshBuses();
    busTimer = setInterval(refreshBuses, BUS_POLL_MS);
  }

  if (btnBuses) {
    btnBuses.addEventListener("click", () => setBusesOn(!busesOn));
  }
  document.addEventListener("visibilitychange", () => {
    if (busesOn && !document.hidden) refreshBuses();
  });
  map.on("moveend", () => {
    if (busesOn && busRows.length) paintBuses();
  });
  syncBusButton();
  const busParams = new URLSearchParams(location.search);
  const busZoom = Number(busParams.get("zoom"));
  if (Number.isFinite(busZoom) && busZoom >= 1 && busZoom <= 19) {
    map.setView(NEWCASTLE, busZoom);
  }
  if (busParams.get("buses") === "1" || location.hash === "#buses") setBusesOn(true);

  refreshDevices();
  setInterval(refreshDevices, 8000);
  setTimeout(() => map.invalidateSize(), 0);

  renderStops();

  const TAXI_CARS = [
    { sign: "T1", colour: "#f5b942", bearing: 210, miles: 2, spread: 0 },
    { sign: "T2", colour: "#38bdf8", bearing: 250, miles: 3, spread: 40 },
    { sign: "T3", colour: "#4ade80", bearing: 175, miles: 2, spread: 80 },
  ];
  const TAXI_NAMES = ["Mina", "Owen", "Priya", "Jack", "Helen", "Tom"];
  let taxiNameAt = 0;
  let taxisOn = false;
  let empireAccount = false;
  const EMPIRE_POLL_MS = 2000;
  let empirePoll = 0;
  let empireTrails = [];
  let empireFares = [];
  let taxiPaintAt = 0;
  let fleetFramed = false;
  const taxiCars = TAXI_CARS.map((spec) => ({
    sign: spec.sign,
    colour: spec.colour,
    bearing: spec.bearing,
    miles: spec.miles,
    spread: spec.spread,
    street: "",
    steps: [],
    marker: null,
    line: null,
    pin: null,
    passenger: null,
    status: "at_depot",
    motion: 0,
    token: 0,
    osrm: true,
  }));

  function nextPassenger() {
    const name = TAXI_NAMES[taxiNameAt % TAXI_NAMES.length];
    taxiNameAt += 1;
    return name;
  }

  function inlandBearing(deg) {
    let bearing = ((deg % 360) + 360) % 360;
    if (bearing < 160) bearing = 160 + (bearing % 50);
    if (bearing > 300) bearing = 220 + (bearing % 70);
    return bearing;
  }

  function taxiLabel(car) {
    if (car.status === "with_passenger") return car.sign + " · " + car.passenger + " aboard";
    if (car.status === "to_passenger") return car.sign + " · collecting " + car.passenger;
    if (car.status === "returning") return car.sign + " · returning";
    return car.sign + " · at depot";
  }

  function paintTaxiList(force) {
    const now = Date.now();
    if (!force && now - taxiPaintAt < 500) return;
    taxiPaintAt = now;
    const list = document.getElementById("taxi-list");
    const status = document.getElementById("taxi-status");
    if (list) {
      list.replaceChildren();
      if (taxisOn && empireAccount) {
        taxiCars.forEach((car) => {
          const li = document.createElement("li");
          li.textContent = taxiLabel(car);
          list.appendChild(li);
        });
      }
    }
    if (!status) return;
    if (!empireAccount) {
      status.textContent = "An account comes before the taxis.";
      return;
    }
    const aboard = taxiCars.filter((car) => car.status === "with_passenger").length;
    let text = aboard === 0
      ? "Taxis are between fares."
      : aboard === 1
        ? "1 taxi has a passenger."
        : aboard + " taxis have passengers.";
    if (taxiCars.some((car) => car.osrm === false)) text += " OSRM unavailable.";
    status.textContent = text;
  }

  function stopCar(car) {
    car.token += 1;
    if (car.motion) cancelAnimationFrame(car.motion);
    car.motion = 0;
  }

  function clearCarLayers(car) {
    if (car.line) map.removeLayer(car.line);
    if (car.pin) map.removeLayer(car.pin);
    if (car.marker) map.removeLayer(car.marker);
    car.line = null;
    car.pin = null;
    car.marker = null;
  }

  function ensureTaxi(car) {
    if (car.marker) return;
    car.marker = L.marker(DEPOT, {
      icon: L.divIcon({
        className: "taxi-marker",
        html: '<span class="taxi-chip" style="background:' + car.colour + '">' + car.sign + "</span>",
        iconSize: [36, 22],
        iconAnchor: [18, 11],
      }),
      title: car.sign + " taxi",
      zIndexOffset: 700,
    }).addTo(map);
    car.marker.on("click", (ev) => {
      if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent);
    });
  }

  function drawCarLine(car, coords) {
    if (car.line) map.removeLayer(car.line);
    car.line = L.polyline(coords, {
      color: car.colour,
      weight: 4,
      opacity: 0.9,
    }).addTo(map);
  }

  function showPassenger(car, latlng) {
    if (car.pin) map.removeLayer(car.pin);
    car.pin = L.marker(latlng, {
      icon: L.divIcon({
        className: "taxi-passenger",
        html: '<span class="taxi-passenger-pin">' + car.passenger + " waiting</span>",
        iconSize: [120, 22],
        iconAnchor: [60, 11],
      }),
      title: car.passenger + " waiting",
      zIndexOffset: 650,
    }).addTo(map);
    car.pin.on("click", (ev) => {
      if (ev.originalEvent) L.DomEvent.stopPropagation(ev.originalEvent);
    });
  }

  function routeSteps(route) {
    const steps = [];
    (route.legs || []).forEach((leg) => {
      (leg.steps || []).forEach((step) => {
        steps.push({ name: step.name || "", duration: step.duration || 0 });
      });
    });
    return steps;
  }

  function streetAt(steps, elapsed) {
    let walked = 0;
    let name = "";
    for (let i = 0; i < steps.length; i += 1) {
      if (steps[i].name) name = steps[i].name;
      walked += steps[i].duration;
      if (walked >= elapsed && name) return name;
    }
    return name;
  }

  function runLeg(car, coords, durationS, token, onDone) {
    if (token !== car.token || !taxisOn) return;
    ensureTaxi(car);
    drawCarLine(car, coords);
    const duration = durationS > 0 ? durationS : fallbackDuration(coords);
    const started = Date.now();
    const frame = () => {
      if (token !== car.token || !taxisOn) return;
      const elapsed = (Date.now() - started) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      const place = placeOnRoute(coords, duration, Math.min(elapsed, duration));
      car.marker.setLatLng(place);
      if (car.steps && car.steps.length) {
        const named = streetAt(car.steps, elapsed);
        car.street = named || ("line " + car.sign);
      }
      const street = car.street ? " · " + car.street : "";
      const offline = car.osrm === false ? " · OSRM unavailable" : "";
      const text = car.status === "with_passenger" && car.passenger
        ? car.passenger + " · " + car.sign + street + offline + " · " + Math.ceil(remaining) + "s"
        : taxiLabel(car) + street + offline + " · " + Math.ceil(remaining) + "s";
      const tip = car.marker.getTooltip();
      if (tip) tip.setContent(text);
      else car.marker.bindTooltip(text, { permanent: true, direction: "right" });
      paintTaxiList(false);
      if (elapsed < duration) car.motion = requestAnimationFrame(frame);
      else {
        car.motion = 0;
        car.marker.setLatLng(coords[coords.length - 1]);
        if (onDone) onDone();
      }
    };
    frame();
  }

  function driveLeg(car, from, to, status, onDone) {
    const token = car.token;
    car.status = status;
    paintTaxiList(true);
    const joined = [from, to].map((point) => point[1].toFixed(6) + "," + point[0].toFixed(6)).join(";");
    fetch(OSRM + joined + "?overview=full&geometries=geojson&steps=true")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        if (token !== car.token || !taxisOn) return;
        const route = data.routes && data.routes[0];
        if (!route) throw new Error("no route");
        car.osrm = true;
        car.steps = routeSteps(route);
        car.street = streetAt(car.steps, 0) || ("line " + car.sign);
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        runLeg(car, coords, route.duration, token, onDone);
      })
      .catch(() => {
        if (token !== car.token || !taxisOn) return;
        driveStraight(car, from, to, token, onDone);
      });
  }

  function driveStraight(car, from, to, token, onDone) {
    car.osrm = false;
    car.steps = [];
    car.street = "line " + car.sign;
    paintTaxiList(true);
    runLeg(car, [from, to], fallbackDuration([from, to]), token, onDone);
  }

  function markAtDepot(car) {
    car.status = "at_depot";
    car.passenger = null;
    car.street = "";
    car.steps = [];
    if (car.marker) {
      car.marker.setLatLng(DEPOT);
      const home = car.sign + " · at depot";
      const tip = car.marker.getTooltip();
      if (tip) tip.setContent(home);
      else car.marker.bindTooltip(home, { permanent: true, direction: "right" });
    }
    if (car.line) map.removeLayer(car.line);
    car.line = null;
    paintTaxiList(true);
  }

  const NEXT_PASSENGER_MS = 4000;

  function scheduleNextPassenger(car, token) {
    setTimeout(() => {
      if (token !== car.token || !taxisOn || car.status !== "at_depot") return;
      beginFare(car);
    }, NEXT_PASSENGER_MS);
  }

  function beginFare(car) {
    if (!taxisOn) return;
    const token = car.token;
    car.bearing = inlandBearing(car.bearing + 37);
    const pickupBearing = inlandBearing(car.bearing + car.spread);
    const pickup = destinationPoint(DEPOT, pickupBearing, 1.2);
    const dropoff = destinationPoint(pickup, inlandBearing(pickupBearing + 45), car.miles);
    car.passenger = nextPassenger();
    showPassenger(car, pickup);
    ensureTaxi(car);
    car.marker.setLatLng(DEPOT);
    const hail = car.sign + " · " + car.passenger + " waiting";
    const tip = car.marker.getTooltip();
    if (tip) tip.setContent(hail);
    else car.marker.bindTooltip(hail, { permanent: true, direction: "right" });
    driveLeg(car, DEPOT, pickup, "to_passenger", () => {
      if (token !== car.token || !taxisOn) return;
      if (car.pin) map.removeLayer(car.pin);
      car.pin = null;
      driveLeg(car, pickup, dropoff, "with_passenger", () => {
        if (token !== car.token || !taxisOn) return;
        driveLeg(car, dropoff, DEPOT, "returning", () => {
          if (token !== car.token || !taxisOn) return;
          markAtDepot(car);
          scheduleNextPassenger(car, token);
        });
      });
    });
  }

  function startFleet() {
    taxiCars.forEach((car, index) => {
      stopCar(car);
      clearCarLayers(car);
      car.status = "at_depot";
      car.passenger = null;
      car.osrm = true;
      const token = car.token;
      ensureTaxi(car);
      car.marker.setLatLng(DEPOT);
      car.marker.bindTooltip(car.sign + " · at depot", { permanent: true, direction: "right" });
      setTimeout(() => {
        if (taxisOn && car.token === token) beginFare(car);
      }, 1500 + index * 7000);
    });
    paintTaxiList(true);
    const params = new URLSearchParams(location.search);
    const busesAsked = params.get("buses") === "1" || location.hash === "#buses";
    if (!fleetFramed && !params.get("zoom") && !busesAsked) {
      fleetFramed = true;
      map.setView([55.01, -1.57], 12);
    }
  }

  function stopFleet() {
    taxiCars.forEach((car) => {
      stopCar(car);
      clearCarLayers(car);
      car.status = "at_depot";
      car.passenger = null;
    });
    paintTaxiList(true);
  }

  const btnTaxis = document.getElementById("btn-taxis");
  function syncTaxiButton() {
    if (!btnTaxis) return;
    btnTaxis.textContent = taxisOn ? "Hide taxis" : "Show taxis";
    btnTaxis.classList.toggle("is-on", taxisOn);
    btnTaxis.setAttribute("aria-pressed", taxisOn ? "true" : "false");
  }
  if (btnTaxis) {
    btnTaxis.addEventListener("click", () => {
      if (!empireAccount) {
        taxisOn = false;
        syncTaxiButton();
        paintTaxiList(true);
        return;
      }
      taxisOn = !taxisOn;
      syncTaxiButton();
      if (taxisOn && empireAccount) paintTaxiList(true);
      else stopFleet();
    });
  }
  const empireForm = document.getElementById("empire-account");
  if (empireForm) empireForm.addEventListener("submit", (ev) => ev.preventDefault());

  async function createEmpireAccount() {
    const status = document.getElementById("empire-account-status");
    const usernameEl = document.getElementById("empire-username");
    const passwordEl = document.getElementById("empire-password");
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    if (username.length < 3) {
      if (status) status.textContent = "Username is at least 3 characters.";
      return;
    }
    if (password.length < 8) {
      if (status) status.textContent = "The password is at least 8 characters.";
      return;
    }
    const base = apiBase();
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    if (status) status.textContent = "Creating the account…";
    try {
      const registered = await fetch(base + "/register", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
      });
      const created = await registered.json().catch(() => null);
      if (!registered.ok) {
        const detail = created && typeof created.detail === "string" ? created.detail : ("HTTP " + registered.status);
        if (status) status.textContent = "Account not created — " + detail;
        return;
      }
      const logged = await fetch(base + "/login", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
      });
      const session = await logged.json().catch(() => null);
      if (!logged.ok || !session || !session.access_token) {
        const detail = session && typeof session.detail === "string" ? session.detail : ("HTTP " + logged.status);
        if (status) status.textContent = "Sign-in after create failed — " + detail;
        return;
      }
      localStorage.setItem("hackathon-empire-token", session.access_token);
      if (status) status.textContent = "Account created. Token stored for " + username + ".";
      startEmpirePoll();
    } catch (err) {
      if (status) status.textContent = "Network or CORS failure.";
    }
  }

  function clearEmpireDraw() {
    taxiCars.forEach((car) => {
      stopCar(car);
      clearCarLayers(car);
      car.passenger = null;
      car.street = "";
      car.steps = [];
    });
    empireTrails.forEach((layer) => map.removeLayer(layer));
    empireFares.forEach((layer) => map.removeLayer(layer));
    empireTrails = [];
    empireFares = [];
    empireAccount = false;
    taxisOn = false;
    paintTaxiList(true);
  }

  async function signInEmpire() {
    const status = document.getElementById("empire-account-status");
    const usernameEl = document.getElementById("empire-username");
    const passwordEl = document.getElementById("empire-password");
    const username = usernameEl ? usernameEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value : "";
    if (username.length < 3) {
      if (status) status.textContent = "Username is at least 3 characters.";
      return;
    }
    if (password.length < 8) {
      if (status) status.textContent = "The password is at least 8 characters.";
      return;
    }
    const base = apiBase();
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    if (status) status.textContent = "Signing in…";
    try {
      const logged = await fetch(base + "/login", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password }),
      });
      const session = await logged.json().catch(() => null);
      if (!logged.ok || !session || !session.access_token) {
        const detail = session && typeof session.detail === "string" ? session.detail : ("HTTP " + logged.status);
        if (status) status.textContent = "Sign-in failed — " + detail;
        return;
      }
      localStorage.setItem("hackathon-empire-token", session.access_token);
      if (status) status.textContent = "Signed in as " + username + ".";
      startEmpirePoll();
    } catch (err) {
      if (status) status.textContent = "Network or CORS failure.";
    }
  }

  function signOutEmpire() {
    stopEmpirePoll();
    localStorage.removeItem("hackathon-empire-token");
    clearEmpireDraw();
    const status = document.getElementById("empire-account-status");
    if (status) status.textContent = "Signed out.";
  }

  function empireToken() {
    return localStorage.getItem("hackathon-empire-token") || "";
  }

  function stopEmpirePoll() {
    if (empirePoll) clearInterval(empirePoll);
    empirePoll = 0;
  }

  async function pollEmpire() {
    const token = empireToken();
    if (!token) {
      stopEmpirePoll();
      return;
    }
    const base = apiBase();
    const status = document.getElementById("empire-account-status");
    if (!base) {
      if (status) status.textContent = "The API address is missing.";
      return;
    }
    if (status) status.textContent = "Asking the box for this account.";
    try {
      const res = await fetch(base + "/v1/empire", {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + token,
        },
      });
      if (!res.ok) return;
      await res.json().catch(() => null);
    } catch (err) {
      if (status) status.textContent = "Asking the box for this account.";
    }
  }

  function startEmpirePoll() {
    stopEmpirePoll();
    pollEmpire();
    empirePoll = setInterval(pollEmpire, EMPIRE_POLL_MS);
  }

  const empireCreate = document.getElementById("empire-create");
  if (empireCreate) empireCreate.addEventListener("click", () => { createEmpireAccount(); });
  const empireSignIn = document.getElementById("empire-signin");
  if (empireSignIn) empireSignIn.addEventListener("click", () => { signInEmpire(); });
  const empireSignOut = document.getElementById("empire-signout");
  if (empireSignOut) empireSignOut.addEventListener("click", () => { signOutEmpire(); });
  if (empireToken()) startEmpirePoll();
  syncTaxiButton();
  paintTaxiList(true);
})();
