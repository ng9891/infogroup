//---
// EVENT LISTENERS
//---

//Button listener to show statisticsContainer
$(".statisticsContainer").click(() => {
    if (LessThan17inch) {
        $(".statisticsContainer").toggleClass("open2");
    }
    else {
        $(".statisticsContainer").toggleClass("open");
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


//---
// END EVENT LISTENERS
//---

//------------------------------------------------------------------------------

//Nav bar search Listeners
$(document).ready(function () {
    let query_input, query_type;
    $("#query-search").keydown((event) => {
        //Enter Key
        if (event.keyCode == 13) {
            event.preventDefault();
            $('#query-button').click();
        }
    });
    //Select all on focus
    $("#query-search").on("click", function () {
        $(this).select();
     });
    //Autocomplete
    $("#query-search").autocomplete(); //Declare the AC on ready
    $("#NAICSDS").autocomplete(); //MODAL AC declaration
    $("#query-search").on('input', () => {
        query_type = d3.select('#query-dropdown').property("value");
        switch (query_type) {
            case 'zip':
                autoComplete_url("#query-search", 'zip');
                break;
            case 'county':
                autoComplete_url("#query-search", 'county');
                break;
            case 'mpo':
                autoComplete_url("#query-search", 'mpo');
                break;
            case 'mun':
                autoComplete_url("#query-search", 'mun');
                break;
        }
    });
    //Search button
    d3.select('#query-button').on('click', (e) => {
        clearUsrMarker(); // function in map.js to clear user drawings
        query_input = d3.select('#query-search').property("value");
        query_type = d3.select('#query-dropdown').property("value");
        query_input = query_input.trim();
        switch (query_type) {
            case 'zip':
                if (query_input.length !== 5 || isNaN(+query_input)) {
                    alert("Invalid Input");
                } else {
                    loadZipEstablishments(query_input);
                }
                break;
            case 'county':
                if (query_input.length <= 3) {
                    alert("Invalid Input");
                } else {
                    loadCountyEstablishments(query_input);
                }
                break;
            case 'mpo':
                if (query_input.length <= 3) {
                    alert("Invalid Input");
                } else {
                    loadMpoEstablishments(query_input);
                }
                break;
            case 'mun':
                if (query_input.length <= 3) {
                    alert("Invalid Input");
                } else {
                    let indexOfDash = query_input.indexOf('-');
                    let mun, county;
                    if(indexOfDash !== -1){
                        let type = query_input.slice(indexOfDash+2);

                        mun = type.slice(0, type.indexOf('/'));
                        county = type.slice(type.indexOf('/')+1);
    
                        query_input = query_input.slice(0, indexOfDash-1);
                    }
                                       
                    loadMunEstablishments(query_input, mun, county);
                }
                break;
        }
    });
});


$(window).on("load", function () {
    // Animate loader off screen
    $(".loader").fadeOut("slow");
});

//Progress bar for chunk loading leaflet cluster
var progress = document.getElementById('progress');
var progressBar = document.getElementById('progress-bar');

function updateProgressBar(processed, total, elapsed, layersArray) {
    // console.log("updateProgressBar");
    // console.log(processed +' '+ total + ' '+ elapsed);
    if (elapsed > 1000) {
        // if it takes more than a second to load, display the progress bar:
        progress.style.display = 'block';
        progressBar.style.width = Math.round(processed / total * 100) + '%';
    }
    if (processed === total) {
        // all markers processed - hide the progress bar:
        progress.style.display = 'none';
    }
}

//------------------------------------------------------------------------------
// JS For Advanced Search Form
function loadData(inputId, controller) {

    switch (controller) {
        case "getindustries":
            d3.json(`/api/getindustries`).then(data => {
                textAutocomplete(data, inputId, controller);
            }, function (err) {
                alert("Query Error");
                console.log(err);
            });
        break;
    }

};

function textAutocomplete(dataValues, inputId, controller) {

    var arr_data = [];

    switch (controller) {
        case "getindustries":
            dataValues.data.map(est => {
                arr_data.push(est.NAICSDS);
            });
        break;
    }

    $(inputId).autocomplete({
        delay: 0,
        minLength: 2,
        //source: arr_data,
        source: function (request, response) {
            var results = $.ui.autocomplete.filter(arr_data, request.term);
            response(results.slice(0, 10));
        },
        messages: {
            noResults: '',
            results: function () {}
        }
    });
};

$(document).ready(function () {

    $("#search-message").hide();

    loadData("#industriesId", "getindustries"); //needs to be changed to use autoComplete_url
    loadData("#entityIndustryId", "getindustries"); //needs to be changed to use autoComplete_url

    autoComplete_url("#countyId", 'county');
    autoComplete_url("#mpoId", 'mpo');
    autoComplete_url("#munId", 'mun');

    
    d3.json(`/api/getsalesvolume`).then(data => {
           loadSalesVolume(data);
		}, function (err) {
		alert("Query Error");
		console.log(err);
    });

    var salvol;
    function loadSalesVolume(input) {
        var dropdown = document.getElementById("salesvolume-dropdown");
        $("#salesvolume-dropdown").empty();
        dropdown.innerHTML = input.data.map(est=>`<a class='dropdown-item' href='#'>${est.LSALVOLDS}</a>`).join("");
        
        $("#salesvolume-dropdown a").click(function(){
            salvol = $(this).text();
            $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
            $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        });

    };

    d3.select('#advsearch-button').on('click', (e) => {
        var industry    = $("#industriesId").val();
        var minempl     = $("#min-emplsize").val();
        var maxempl     = $("#max-emplsize").val();
        var county_name = $("#countyId").val();
        var mpo_name    = $("#mpoId").val();
        var mun_name    = $("#munId").val(), mun_type, mun_county;

        var indexOfDash = mun_name.indexOf('-');
        if(indexOfDash !== -1){
            var type = mun_name.slice(indexOfDash+2);
            mun_type = type.slice(0, type.indexOf('/'));
            mun_county = type.slice(type.indexOf('/')+1);
            mun_name = mun_name.slice(0, indexOfDash-1);
        }

        // console.log("County: " + county);
        // console.log("MPO: " + mpo);
        // console.log("Mun: " + mun);
        // console.log("Mun Type: " + mun_type);
        // console.log("Mun County: " + mun_county);

        loadAdvancedSearchEstablishments(industry, minempl, maxempl, salvol, county_name, mpo_name, mun_name, mun_type, mun_county);
        $(".advancedSearchContainer").toggleClass("open");
    });

});
// END Advanced Search
//------------------------------------------------------------------------------

function updateSearchInfo(searchType, searchValue) {
    if (!searchType) searchType = 'error';
    if (!searchValue) searchValue = '';
    if (searchType == 'Search:'){
        $('#search-description').html('<h4>' + searchType + ' ' + searchValue[0] + '</h4> <p>'+ searchValue[1] + '</p>');
    }else{
        $('#search-description').html('<h4>' + searchType + ' ' + searchValue + '</h4>');
    }
}

