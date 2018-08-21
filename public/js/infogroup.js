//---
// EVENT LISTENERS
//---
//TODO: Change Go button to query selected options
// Go button click listener
d3.select('.go-button').on('click', (e) => {
    let value = d3.select('#zipInput').property("value")
    if (value.length !== 5 || isNaN(+value)) {
        alert("Invalid Input");
    } else {
        $('#zipInput').blur();
        loadZipEstablishments(value);
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
//---
// END EVENT LISTENERS
//---


//------------------------------------------------------------------------------
//TEST
//BUTTON FOR COUNTY
// Go button click listener
d3.select('.county_go-button').on('click', (e) => {
    let value = d3.select('#countyInput').property("value")
    if (value.length === '') {
        alert("Invalid Input");
    } else {
        $('#countyInput').blur();
        loadCountyEstablishments(value);
    }
});
//Input Text Box on Enter key press
$("#countyInput").on("keydown", (e) => {
    if (e.keyCode == 13) {
        $('.county_go-button').click();
    }
});

d3.select('.county_next-button').on('click', (e) => {
    //TODO: Find a way to save the offset value in a var or URL for offsetting
    //Send the amount of current points for offset

    //redirect to /county
    window.location.href = window.location.href + '?offset=0';

    // loadCountyEstablishments(value, markers.length);
});
//END OF TEST
//------------------------------------------------------------------------------