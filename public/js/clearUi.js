/*
* Function to clear up the div containing the piechart, histogram and user markers
* to set up for the next user requested data.

* Dependencies: variable usrMarkers in map.js
*/
function clearUi() {
    $("div.Object-desc").empty();
    $("#pieChart").empty();
    if (usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user
}