/*
* This file makes a server query request based on the drawing made by the user
* and display the data on the website
*
* Checks for the last layer of the user input and gets the coordinate for the layer.
* Makes a request to the server with the required parameters and loads the map, histogram,
* piechart and datatable with the information.
*
* Dependencies: leaflet.js, leaflet.editable.js, mymap.js, jquery.js, d3.js
*
* Expected input: layer {array} with correct drawing layer.
*
* Output: Information loaded into the webpage based on the desired query area.
*/

//Helper functions to check the type of drawing
function drawingType(layer){
    if (layer instanceof L.Marker) return 'marker';
    if (layer instanceof L.Circle) return 'circle';
    if (layer instanceof L.Rectangle) return 'rectangle';
    if (layer instanceof L.Polygon) return 'polygon';
}

// Helper functions that creates the URL for marker query
function markerQuery(layer){
    let lat,lon, reqURL;
    lat = layer.getLatLng().lat;
    lon = layer.getLatLng().lng;
    // Creates a request URL for the API
    reqURL = '/api/bydistance';
    if (lon) {
        reqURL += '?lon=' + lon;
        if (lat) {
            reqURL += '&lat=' + lat;
        }
    }
    return reqURL;
}
// Helper functions that creates the URL for circle query
function circleQuery(layer){
    let lat, lon, dist, reqURL;
    lat = layer.getLatLng().lat;
    lon = layer.getLatLng().lng;
    dist = layer.getRadius();
    // Creates a request URL for the API
    reqURL = '/api/bydistance';
    if (lon) {
        reqURL += '?lon=' + lon;
        if (lat) {
            reqURL += '&lat=' + lat;
            if (dist) {
                reqURL += '&dist=' + dist;
            }
        }
    }
    return reqURL;
}
// Helper functions that creates the URL for rectangle query
function rectangleQuery(layer){
    var rectangle = layer.getLatLngs();

    var maxLon = rectangle[0][0].lng;
    var maxLat = rectangle[0][0].lat;

    var minLon = rectangle[0][2].lng;
    var minLat = rectangle[0][2].lat;

    // Creates a request URL for the API
    reqURL = '/api/byrectangle';
    if (rectangle) {
        reqURL += '?minLon=' + minLon + '&minLat=' + minLat + '&maxLon=' + maxLon + '&maxLat=' + maxLat;
    }
    return reqURL;
}

function loadDrawingEstablishments() {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
    $("#pieChart").empty();

    // console.log(usrMarkers.length);
    if(usrMarkers.length===0) return;

    let reqURL, searchValue, searchType;
    let layer = usrMarkers[usrMarkers.length - 1]; //last layer
    switch(drawingType(layer)){
        case 'marker':
            reqURL = markerQuery(layer);
            searchType = 'Marker Query';
            searchValue = '1mi';
            break;
        case 'circle':
            reqURL = circleQuery(layer);
            searchType = 'Circle Query';
            let radius = layer.getRadius() * 0.00062137;
            searchValue = radius.toFixed(4) + 'mi';
            break;
        case 'rectangle':
            reqURL = rectangleQuery(layer);
            searchType = 'Rectangle Query';
            searchValue = '';
            break;
        case 'polygon':
            break;
        default:
            console.log('Error. Shape is not recognizable');
            return;
    }

    // console.log(reqURL);
	
	d3.json(reqURL)
		.then(data => {
			if (data.data.length === 0){
				updateSearchInfo(searchType, searchValue);
			}else{
				mapEstablishments(data);
				loadPieChart(data);
                loadDatatable(data);
                updateSearchInfo(searchType, searchValue);
                loadHistogram(data);
			}
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}