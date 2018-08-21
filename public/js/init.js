//Setup Leaflet Map
var mymap = L.map('mapid').setView([40.755, -74.00], 13);
var markers = [];
var usrMarkers = [];
var table;
var lat, lon;

L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 20,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);

//---
// MAP EVENT LISTENERS
//---
mymap.addEventListener('mousemove', function (ev) {
    lat = ev.latlng.lat;
    lon = ev.latlng.lng;
});

mymap.addEventListener("contextmenu", function (event) {
    // Prevent the browser's context menu from appearing
    // event.preventDefault();

    if(usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop());
    // Add marker
    let marker = L.marker([lat, lon]);
    marker.addTo(mymap);
    usrMarkers.push(marker);
    loadDistanceEstablishments(lon, lat);
    return false; // To disable default popup.
});
//---
// END MAP EVENT LISTENER
//---

//-----
// BEGIN Test
//-----
//  Parse URL and call API accordingly
// authors note: is this the only way to go? or use templating
var url = new URL(window.location.href);

//locate the middle occurrence of the / character in your URL and cut it.
var path = url.pathname.substr(url.pathname.indexOf('/') + 1, url.pathname.lastIndexOf('/') - 1);
//locate the last occurrence of the / character in your URL and cut it.

console.log(path);
switch (path) {
    case 'county':
        console.log("County Page");
        var county = url.pathname.substr(url.pathname.lastIndexOf('/') + 1);
        console.log(county);
        if (url.search !== '') {
            console.log(url.search);
            let params = new URLSearchParams(url.search.substring(1)); //drop the leading "?"
            console.log(parseInt(params.get("offset")));
        } else {
            console.log('Empty query');
        }
        break;
    default:
        console.log("HomePage");
}
//-----
// END Test
//-----


// --
// on Load, load zipcode 10001
// --
// loadDistanceEstablishments(-74.00157809257509, 40.71972943412674, 500);
// loadCountyEstablishments('Westchester'); // From load_county.js. Takes an offset for pagination
loadZipEstablishments(10001) // From load_zip.js