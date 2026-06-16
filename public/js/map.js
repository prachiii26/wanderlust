document.addEventListener("DOMContentLoaded", function () {
  const lat = window.coordinates[1];
  const lng = window.coordinates[0];

  const map = L.map("map").setView([lat, lng], 10);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(window.locationName)
    .openPopup();
});