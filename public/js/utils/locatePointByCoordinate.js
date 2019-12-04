// Marker creation when a business is selected
let selectedBusinessMkr;
function locatePointByCoordinate(lat, lon) {
  if (lat != null && lon != null) {
    mymap.setView([lat, lon], 19);
    if (selectedBusinessMkr) {
      mymap.removeLayer(selectedBusinessMkr);
    }
    selectedBusinessMkr = new L.marker([lat, lon], {}).addTo(mymap);
    selectedBusinessMkr.on('click', () => {
      mymap.removeLayer(selectedBusinessMkr);
    });
    markerList.push(selectedBusinessMkr);
  }
}
