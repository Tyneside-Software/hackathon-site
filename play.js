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
})();
