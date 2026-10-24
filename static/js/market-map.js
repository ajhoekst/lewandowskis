const marketMap = document.querySelector('[data-market-map]');
if (marketMap && window.L) {
  const map = window.L.map(marketMap, { scrollWheelZoom: false }).setView([42.9764, -85.7014], 16);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);
  window.L.circleMarker([42.9764, -85.7014], {
    color: '#fffdd0',
    fillColor: '#a80005',
    fillOpacity: 1,
    radius: 9,
    weight: 3,
  }).addTo(map).bindPopup("Lewandoski's Market");
}
