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

//TODO: Change Go button to query selected options
// Go button click listener
d3.select('.go-button').on('click', (e) => {
    let value = d3.select('#zipInput').property("value")
    if (value.length !== 5 || isNaN(+value)) {
        alert("Invalid Input");
    }else{
        $('#zipInput').blur();
        loadZipEstablishments(value);
    }
});
//Input Text Box on Enter key press
$("#zipInput").on("keypress", function search(e) {
    if (e.keyCode == 13) {
        $('.go-button').click();
    }
});

//Button listener to show advancedSearchContainer
$(".advancedSearchContainerButton").click(() => {
    $(".advancedSearchContainer").toggleClass("open");
});

//Button listener to hide infoContainer
$(".infoContainerButton").click(() => {
    $(".infoContainer").toggleClass("closed");
});

//------------------------------------------------------------------------------
//TEST
//BUTTON FOR COUNTY
// Go button click listener
d3.select('.county_go-button').on('click', (e) => {
    let value = d3.select('#countyInput').property("value")
    if (value.length === '') {
        alert("Invalid Input");
    }else{
        $('#countyInput').blur();
        loadCountyEstablishments(value);
    }
});
//Input Text Box on Enter key press
$("#countyInput").on("keydown", function search(e) {
    if (e.keyCode == 13) {
        $('.county_go-button').click();
    }
});

$( function() {
    var availableTags = [
      "ActionScript",
      "AppleScript",
      "Asp",
      "BASIC",
      "C",
      "C++",
      "Clojure",
      "COBOL",
      "ColdFusion",
      "Erlang",
      "Fortran",
      "Groovy",
      "Haskell",
      "Java",
      "JavaScript",
      "Lisp",
      "Perl",
      "PHP",
      "Python",
      "Ruby",
      "Scala",
      "Scheme"
    ];
    $( "#tags" ).autocomplete({
      source: availableTags
    });
  } );