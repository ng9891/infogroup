//---
// EVENT LISTENERS
//---

//Button listener to show statisticsContainer
$(".statisticsContainerButton").click(() => {
    $(".statisticsContainer").toggleClass("open");
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
    //Autocomplete
    $("#query-search").autocomplete(); //Declare the AC on ready
    $("#query-search").on('input', () => {
        query_type = d3.select('#query-dropdown').property("value");
        switch (query_type) {
            case 'zip':
                autoComplete_url('zip');
                break;
            case 'county':
                autoComplete_url('county');
                break;
            case 'mpo':
                autoComplete_url('mpo');
                break;
            case 'city':
                autoComplete_url('city');
                break;
        }
    });
    //Search button
    d3.select('#query-button').on('click', (e) => {
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
                //TODO: validate entry
                loadMpoEstablishments(query_input);
                break;
            case 'city':
                //TODO: validate entry
                loadCityEstablishments(query_input);
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
$(document).ready(function () {

    $("#search-message").hide();

    d3.json(`/api/getindustries`).then(data => {
        loadIndustries(data);
    }, function (err) {
        alert("Query Error");
        console.log(err);
    });

    function loadIndustries(input) {

        var arr_data = [];

        input.data.map(est => {
            arr_data.push(est.NAICSDS);
        });

        $("#tags").autocomplete({
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
    }

    var borough;
    $(".dropdown-menu a").click(function () {
        borough = $(this).text();
        $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
    });

    d3.select('#advsearch-button').on('click', (e) => {
        var industry = $("#tags").val();
        var employee = $("#emplsize").val();
        loadAdvancedSearchEstablishments(industry, employee, borough);
    });

});

function updateSearchInfo(searchType, searchValue) {
    if (!searchType) searchType = 'error';
    if (!searchValue) searchValue = '';
    $('#search-description').html('<h4>' + searchType + ' ' + searchValue + '</h4>');
}