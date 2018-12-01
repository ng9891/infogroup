function clearUi() {
    $("div.Object-desc").empty();
    $("#pieChart").empty();
    if (usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user
}