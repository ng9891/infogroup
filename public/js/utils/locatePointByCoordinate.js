// Marker creation when a business is selected
let selectedBusinessMkr;
function removeSelectedBusinessMkr() {
  removeMarker(selectedBusinessMkr);
}

function enableDragBusinessMarker(){
  let coord = selectedBusinessMkr.getLatLng();
  locatePointByCoordinateDrag(coord.lat, coord.lng);
}

function disableDragBusinessMarker(){
  selectedBusinessMkr.dragging.disable();
}

function locatePointByCoordinate(lat, lon) {
  if (lat && lon) {
    mymap.setView([lat, lon], 19);
    removeSelectedBusinessMkr();
    selectedBusinessMkr = new L.marker([lat, lon], {});
    selectedBusinessMkr.addTo(mymap);
  }
}

function locatePointByCoordinateDrag(lat, lon) {
  if (lat && lon) {
    mymap.setView([lat, lon], 19);
    removeSelectedBusinessMkr();
    selectedBusinessMkr = newDraggableMarkerByLatLon(lat, lon);
    selectedBusinessMkr.addTo(mymap);
  }
}

function locatePointByCoordinateDel(lat, lon) {
  if (lat && lon) {
    mymap.setView([lat, lon], 19);
    removeSelectedBusinessMkr();
    selectedBusinessMkr = newDeletableMarkerByLatLon(lat, lon);
    selectedBusinessMkr.addTo(mymap);
  }
}