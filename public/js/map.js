//File for the initialization of the leaflet Map and Event listeners
//Setup Leaflet Map

//markers will contain the markers for the plugin markerClusterGroup
var markers = L.markerClusterGroup({
    spiderfyOnMaxZoom: false,
    disableClusteringAtZoom: 19,
    chunkedLoading: true,
    chunkProgress: updateProgressBar
});
var markerList = []; //contains all the points from query
var queryLayer = []; //contains the query layer or bounding box of query
var usrMarkers = []; //contains all the marker drawn by user
// var table;
var lat, lon;
// var redoBuffer = [];

var mapBox = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    });

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var OpenMapSurfer_Roads = L.tileLayer('https://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
    maxZoom: 19,
    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var mymap = L.map('mapid', {
    editable: true,
    maxZoom: 19,
    layers: [mapBox]
}).setView([40.755, -74.00], 13);

var baseMaps = {
    "MapBox": mapBox,
    "OSM-Mapnik": OpenStreetMap_Mapnik,
    "OSM-Black & White": OpenStreetMap_BlackAndWhite,
    "OpenMapSurfer-Roads" : OpenMapSurfer_Roads,
    "Esri-WorldStreetMap" : Esri_WorldStreetMap
};

var layerControl = L.control.layers(baseMaps, null, {position: 'bottomleft'}).addTo(mymap);
// mapBox.addTo(mymap);
// OpenStreetMap_Mapnik.addTo(mymap);
// OpenMapSurfer_Roads.addTo(mymap);

var drawnItems = new L.FeatureGroup().addTo(mymap); //Array containing drawing objects

//---
// MAP CONTROL TOOLS
//---
L.EditControl = L.Control.extend({
    options: {
        position: 'topleft',
        callback: null,
        type: '',
        kind: '',
        html: ''
    },
    onAdd: function (map) {
        var container = '';
        switch (this.options.type) {
            case 'draw':
                container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
                var link = L.DomUtil.create('a', '', container);
                link.href = '#';
                link.title = 'Create a new ' + this.options.kind;
                link.innerHTML = this.options.html;
                L.DomEvent.on(link, 'click', L.DomEvent.stop)
                    .on(link, 'click', function () {
                        window.LAYER = this.options.callback.call(map.editTools);
                    }, this);
                break;
            case 'query':
                //Defines the query button
                container = L.DomUtil.create('div', 'leaflet-control leaflet-bar queryBtn');
                var link = L.DomUtil.create('a', 'leaflet-control-queryBtn', container);
                container.style = 'display:none;'
                link.href = '#';
                link.title = 'Query the drawing';
                link.innerHTML = this.options.html;
                L.DomEvent.on(link, 'click', L.DomEvent.stop);
                break;
        }
        return container;
    }
});

L.NewPolygonControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: mymap.editTools.startPolygon,
        kind: 'polygon',
        html: '▰',
        type: 'draw'
    }
});

L.NewMarkerControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: mymap.editTools.startMarker,
        kind: 'marker',
        html: '&#9873',
        type: 'draw'
    }
    //🖈
});

L.NewRectangleControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: mymap.editTools.startRectangle,
        kind: 'rectangle',
        html: '⬛',
        type: 'draw'
    }
});

L.NewCircleControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: mymap.editTools.startCircle,
        kind: 'circle',
        html: '⬤',
        type: 'draw'
    }
});

L.NewQueryControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: mymap.editTools.startCircle,
        kind: 'circle',
        html: '&#128269',
        type: 'query'
    }
});

// mymap.addControl(new L.NewPolygonControl());
mymap.addControl(new L.NewRectangleControl());
mymap.addControl(new L.NewCircleControl());
mymap.addControl(new L.NewMarkerControl());
mymap.addControl(new L.NewQueryControl());
//---
// END MAP CONTROL TOOLS
//---

//---
// MAP EVENT LISTENERS
//---
//Helper function to get drawing type.
function drawingType(layer) {
    if (layer instanceof L.Marker) return 'marker';
    if (layer instanceof L.Circle) return 'circle';
    if (layer instanceof L.Rectangle) return 'rectangle';
    if (layer instanceof L.Polygon) return 'polygon';
}

var tooltip = L.DomUtil.get('draw-tooltip'); // Tooltip providing info of radius for circle drawing

// Loads the establishments around the drawing area
function queryDrawing() {
    console.log(0);
    loadDrawingEstablishments();
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

function addTooltip(e) {
    removeTooltip(); //Get rid of old drwaing tooltip
    if (!e) return;
    //Draw radius if its circle query
    if (e.layer instanceof L.Circle) {
        mymap.on('editable:drawing:move', printRadius); // To print radius
        L.DomEvent.on(document, 'mousemove', moveTooltip); // To update div position
    }
}

function removeTooltip() {
    tooltip.innerHTML = '';
    tooltip.style.display = 'none';
    L.DomEvent.off(document, 'mousemove', moveTooltip);
    mymap.off('editable:drawing:move', printRadius);
}

function moveTooltip(e) {
    tooltip.style.left = e.clientX + 20 + 'px';
    tooltip.style.top = e.clientY - 10 + 'px';
}

function addUsrMarker(e) {
    // On drawing commit, push drawing
    usrMarkers.push(e.layer);
    drawnItems.addLayer(e.layer);
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

//Event listeners key down during drawing
var onKeyDown = function (e) {
    //ESC button to stop drawing.
    if (e.keyCode == 27) {
        if (!this.editTools._drawingEditor) return;
        //TODO: Circle not working correctly with ESC
        let test = this.editTools._drawingEditor.pop();
        this.editTools._drawingEditor.disable();
        //drawnItems.clearLayers();
        this.editTools.stopDrawing();
    }
    //UNDO button CTRL + Z.
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
        latlng = this.editTools._drawingEditor.pop();
        if (!latlng) this.editTools.stopDrawing();
    }
};
L.DomEvent.addListener(document, 'keydown', onKeyDown, mymap);

//---
// END MAP EVENT LISTENER
//---