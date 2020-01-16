//File for the initialization of the leaflet Map and Event listeners
//Setup Leaflet Map

//markers will contain the markers for the plugin markerClusterGroup
const markers = L.markerClusterGroup({
  spiderfyOnMaxZoom: true,
  disableClusteringAtZoom: 20,
  chunkedLoading: true,
});
let markerList = []; //contains all the points from query
let queryLayer = []; //contains the query layer or bounding box of query
let usrMarkers = []; //contains all the marker drawn by user
let featureSelected;

// var redoBuffer = [];

const mapBox = L.tileLayer(
  'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  {
    maxZoom: 20,
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets',
  }
);

const Stamen_Toner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
  attribution:
    'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png',
});

const OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const Esri_WorldStreetMap = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  {
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
  }
);

const googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
});

const googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 20,
  subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
});

var mymap = L.map('mapid', {
  preferCanvas: true,
  keyboard: false,
  editable: true,
  maxZoom: 20,
  layers: [mapBox],
}).setView([40.755, -74.0], 13);

var baseMaps = {
  MapBox: mapBox,
  GoogleStreets: googleStreets,
  'OSM-Black & White': OpenStreetMap_BlackAndWhite,
  'Stamen-Toner': Stamen_Toner,
  'Esri-WorldStreetMap': Esri_WorldStreetMap,
  Satellite: googleSat,
};

var layerControl = L.control.layers(baseMaps, null, {position: 'bottomleft'}).addTo(mymap);
// mapBox.addTo(mymap);
// OpenStreetMap_Mapnik.addTo(mymap);
// OpenMapSurfer_Roads.addTo(mymap);

var drawnItems = new L.FeatureGroup().addTo(mymap); // Array containing drawing objects

//---
// MAP CONTROL TOOLS
//---
L.EditControl = L.Control.extend({
  options: {
    position: 'topleft',
    callback: null,
    type: '',
    kind: '',
    html: '',
  },
  onAdd: function(map) {
    let container = '';
    let link;
    let measurementOptions = {
      imperial: true,
    };
    switch (this.options.type) {
      case 'draw':
        container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
        link = L.DomUtil.create('a', '', container);
        link.href = '#';
        let drawingOptions = {kind: this.options.kind, showMeasurements: true, measurementOptions: measurementOptions};
        if (drawingOptions.kind === 'road') {
          link.title = 'Find nearby road';
          let redIcon = new L.Icon({
            iconUrl: '/stylesheet/images/leaflet-color-markers/marker-icon-red.png',
            shadowUrl: '/stylesheet/images/leaflet-color-markers/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          });
          drawingOptions.icon = redIcon;
        } else {
          link.title = 'Create a new ' + this.options.kind;
        }
        link.innerHTML = this.options.html;
        L.DomEvent.on(link, 'click', L.DomEvent.stop).on(
          link,
          'click',
          function() {
            window.LAYER = this.options.callback.call(map.editTools, null, drawingOptions);
          },
          this
        );
        break;
      case 'query':
        //Defines the query button
        container = L.DomUtil.create('div', 'leaflet-control leaflet-bar queryBtn');
        link = L.DomUtil.create('a', 'leaflet-control-queryBtn', container);
        container.style = 'display:none;';
        link.href = '#';
        link.title = 'Query the drawing';
        link.innerHTML = this.options.html;
        L.DomEvent.on(link, 'click', L.DomEvent.stop);
        break;
    }
    return container;
  },
});

L.NewPolygonControl = L.EditControl.extend({
  options: {
    position: 'topleft',
    callback: mymap.editTools.startPolygon,
    kind: 'polygon',
    html: '▰',
    type: 'draw',
  },
});

L.NewMarkerControl = L.EditControl.extend({
  options: {
    position: 'topleft',
    callback: mymap.editTools.startMarker,
    kind: 'marker',
    html: '&#9873',
    type: 'draw',
  },
  //🖈
});

L.NewRectangleControl = L.EditControl.extend({
  options: {
    position: 'topleft',
    callback: mymap.editTools.startRectangle,
    kind: 'rectangle',
    html: '⬛',
    type: 'draw',
  },
});

L.NewCircleControl = L.EditControl.extend({
  options: {
    position: 'topleft',
    callback: mymap.editTools.startCircle,
    kind: 'circle',
    html: '⬤',
    type: 'draw',
  },
});

L.NewLineControl = L.EditControl.extend({
  options: {
    position: 'topleft',
    callback: mymap.editTools.startPolyline,
    kind: 'line',
    html: '\\/\\',
    type: 'draw',
  },
});

L.RoadSelectControl = L.EditControl.extend({
  options: {
    position: 'topleft',
    callback: mymap.editTools.startMarker,
    kind: 'road',
    html: '&#9945',
    type: 'draw',
  },
});

L.NewQueryControl = L.EditControl.extend({
  options: {
    position: 'topleft',
    callback: mymap.editTools.startCircle,
    kind: 'circle',
    html: '&#128269',
    type: 'query',
  },
});

// mymap.addControl(new L.NewPolygonControl());
mymap.addControl(new L.NewRectangleControl());
mymap.addControl(new L.NewCircleControl());
mymap.addControl(new L.NewMarkerControl());
mymap.addControl(new L.NewLineControl());
mymap.addControl(new L.RoadSelectControl());
mymap.addControl(new L.NewQueryControl());
//---
// END MAP CONTROL TOOLS
//---

//---
// MAP EVENT LISTENERS
//---
let tooltip = L.DomUtil.get('map-draw-tooltip'); // Tooltip providing info of radius for circle drawing

// Loads the establishments around the drawing area
function queryDrawing() {
  // loadDrawingEstablishments();
  let query_version = d3.select('#version-dropdown').property('value');
  loadEstablishments('draw', usrMarkers, query_version);
  // Clear tooltip but we don't want to get rid of the listeners for drawing edits.
  tooltip.style.display = 'none';
}
// Converts radius to miles and display it in the #draw-tooltip div.
function printRadius(e) {
  let radius = e.layer.getRadius() * 0.00062137;
  radius = radius.toFixed(4) + 'mi';
  tooltip.innerHTML = radius;
  tooltip.style.display = 'block';
}

// Called when drawing and moving.
function printTotalLength(e) {
  e.layer.updateMeasurements();
  if (!e.layer._measurementLayer) return;
  let segments = e.layer._measurementLayer._layers;
  let totalLen = 0;
  let segmentKeys = Object.keys(segments);
  if (segmentKeys.length > 1) {
    // Gets total lenght. Usually at last index.
    totalLen = segments[segmentKeys[segmentKeys.length - 1]]._measurement;
    let unit = totalLen.slice(totalLen.indexOf(' ') + 1);
    totalLen = parseFloat(totalLen.slice(0, totalLen.indexOf(' ')));
    if (unit === 'ft') totalLen *= 0.000189394; // Converts feet to miles.
  }
  let segLen = lastVertex.latlng.distanceTo(e.latlng) * 0.00062137; // var lastVertex is changed on new vertex.
  totalLen = totalLen + segLen;
  e.layer.totalLen = totalLen.toFixed(4);
  segLen = segLen.toFixed(2);
  tooltip.innerHTML = `Segment:${segLen}mi Total:${e.layer.totalLen}mi</br>Click on last point to finish.`;
  tooltip.style.display = 'block';
}

function addTooltip(e) {
  removeTooltip(); // Get rid of old drawing tooltip
  if (!e) return;
  //Draw radius if its circle query
  if (e.layer instanceof L.Circle) {
    mymap.on('editable:drawing:move', printRadius); // To print radius
    L.DomEvent.on(document, 'mousemove', moveTooltip); // To update div position
  } else if (e.layer instanceof L.Polyline) {
    if(e.layer instanceof L.Rectangle) return;
    mymap.on('editable:drawing:move', printTotalLength);
    L.DomEvent.on(document, 'mousemove', moveTooltip);
  }
}

function removeTooltip() {
  tooltip.innerHTML = '';
  tooltip.style.display = 'none';
  L.DomEvent.off(document, 'mousemove', moveTooltip);
  mymap.off('editable:drawing:move', printRadius);
  mymap.off('editable:drawing:move', printTotalLength);
}

function moveTooltip(e) {
  if (!e) return;
  tooltip.style.left = e.clientX + 20 + 'px';
  tooltip.style.top = e.clientY - 10 + 'px';
}

function addUsrMarker(e) {
  // If its a road nearby query;
  // On drawing commit, push drawing
  usrMarkers.push(e.layer);
  drawnItems.addLayer(e.layer);
  if (e.layer.options.kind && e.layer.options.kind == 'road') {
    e.layer.dragging.disable();
    let latlng = e.layer.getLatLng();
    return loadNearbyRoads(latlng.lat, latlng.lng);
  } else if (e.layer.options.kind && e.layer.options.kind == 'line') {
    removeTooltip();
  }
  $('.leaflet-control.leaflet-bar.queryBtn').css('display', 'block'); // Display the query button
  $('.leaflet-control-queryBtn').on('click', queryDrawing); // QUERY BUTTON LISTENER
  // drawnItems.clearLayers();
}

function clearUsrMarker(e) {
  // On drawing start, clear prev marker and add tooltip.
  usrMarkers.pop();
  drawnItems.clearLayers();
  $('.leaflet-control.leaflet-bar.queryBtn').css('display', 'none'); // hide btn so no meaningless query request
  $('.leaflet-control-queryBtn').off('click');
  addTooltip(e);
}

mymap.on('editable:drawing:start', clearUsrMarker);
mymap.on('editable:drawing:commit', addUsrMarker);
mymap.on('editable:vertex:drag editable:vertex:deleted', function(e) {
  e.layer.updateMeasurements();
  moveTooltip(e.originalEvent);
});
let lastVertex;
mymap.on('editable:vertex:new', function(e) {
  lastVertex = e;
});
mymap.on('editable:vertex:dragend editable:drawing:cancel', () => {
  removeTooltip();
});

//Event listeners key down during drawing
let onKeyDown = function(e) {
  // ESC button to stop drawing.
  if (e.keyCode == 27) {
    if (!this.editTools._drawingEditor) return;
    for (key in this.editTools.featuresLayer._layers) mymap.removeLayer(this.editTools.featuresLayer._layers[key]);
    // this.editTools._drawingEditor.editLayer.clearLayers();
    // this.editTools._drawingEditor.pop();
    // this.editTools._drawingEditor.disable();
    this.editTools.stopDrawing();
  }
  // UNDO button CTRL + Z.
  if (e.keyCode === 90 && e.ctrlKey) {
    if (!this.editTools._drawingEditor) {
      //IF not drawing. Remove last feature.
      if (usrMarkers.length > 0) {
        //usually 1 drawing
        usrMarkers.pop();
        drawnItems.clearLayers();
        $('.leaflet-control.leaflet-bar.queryBtn').css('display', 'none');
        removeTooltip();
      }
      return;
    }
    let latlng = this.editTools._drawingEditor.pop();
    if (!latlng) this.editTools.stopDrawing();
  }
};
L.DomEvent.addListener(document, 'keydown', onKeyDown, mymap);

//---
// END MAP EVENT LISTENER
//---

function addOverlayToMap(layerObject) {
  // TODO: Check if valid
  queryLayer.push(layerObject);
  mymap.addLayer(layerObject);
  layerControl.addOverlay(layerObject, 'Overlay Layer');
}

function newDeletableMarkerByLatLon(lat, lon) {
  let marker = new L.marker([lat, lon], {});
  marker.on('click', (e) => {
    removeMarker(e.target);
  });
  return marker;
}

function newDraggableMarkerByLatLon(lat, lon) {
  let marker = new L.marker([lat, lon], {
    draggable: true,
    autoPan: true,
  });
  return marker;
}

function removeMarker(marker) {
  if (marker) mymap.removeLayer(marker);
}
