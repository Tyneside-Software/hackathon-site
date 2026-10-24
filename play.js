(function () {
  document.documentElement.dataset.page = "taxi-game";
  const map = L.map("play-map");
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  map.setView([54.9783, -1.6178], 10);
})();
