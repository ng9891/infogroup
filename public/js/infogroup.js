//Setup Leaflet Map
var mymap = L.map('mapid').setView([40.755, -74.00], 13);
var markers = [];
var table;
L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 20,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);

// Go button click listener
d3.select('.go-button').on('click', (e) => {
    let value = d3.select('#zipInput').property("value")
    if (value.length !== 5 || isNaN(+value)) {
        alert("Invalid Input");
    }else{
        $('#zipInput').blur();
        loadEstablishments(value);
    }
});
//Input Text Box on Enter key press
$("#zipInput").on("keydown", function search(e) {
    if (e.keyCode == 13) {
        $('.go-button').click();
    }
});

//Button listener to hide infoContainer
$(".infoContainerButton").click(() => {
    $(".infoContainer").toggleClass("closed");
});
