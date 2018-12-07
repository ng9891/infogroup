/*
* Infogroup.js contains general logistic and listeners of the site.
*
* It will load the necessary dropdowns and autocomplete when document is ready by
* calling loadAutoComplete and loadDropdown
* 
* Creates event listeners of the main webpage. 
*   - Navigation bar search button.
*   - Hidding and showing side panels
*   - Advanced search container listeners when opened
*
* Call appropiate query handler depending on nav dropdown query type selection
*
* Dependencies: loadAutoComplete.js, loadDropdown.js, jquery.js
*
* Expected input: None.
*
* Output: Initial page working properly with dropdowns and autocomplete features.
*/
$(document).ready(function () {
    let query_input, query_type;
    $("#query-search").keydown((event) => {
        //Enter Key
        if (event.keyCode == 13) {
            event.preventDefault();
            $('#query-button').click();
        }
    });
    // Select all on focus of nav bar search
    $("#query-search").on("click", function () {
        $(this).select();
    });

    // Search button on nav bar
    d3.select('#query-button').on('click', (e) => {
        clearUsrMarker(); // function in map.js to clear user drawings
        query_input = d3.select('#query-search').property("value");
        query_type = d3.select('#query-dropdown').property("value");
        query_version = d3.select('#version-dropdown').property("value");
        query_input = query_input.trim();
        switch (query_type) {
            case 'zip':
                if (query_input.length < 4 || isNaN(+query_input)) {
                    alert("Invalid Input");
                } else {
                    loadZipEstablishments(query_input, query_version);
                }
                break;
            case 'county':
                if (query_input.length <= 3) {
                    alert("Invalid Input");
                } else {
                    loadCountyEstablishments(query_input, query_version);
                }
                break;
            case 'mpo':
                if (query_input.length <= 3) {
                    alert("Invalid Input");
                } else {
                    loadMpoEstablishments(query_input, query_version);
                }
                break;
            case 'mun':
                if (query_input.length <= 3) {
                    alert("Invalid Input");
                } else {
                    let indexOfDash = query_input.indexOf('-');
                    let mun, county;
                    if (indexOfDash !== -1) {
                        let type = query_input.slice(indexOfDash + 2);
                        mun = type.slice(0, type.indexOf('/'));
                        county = type.slice(type.indexOf('/') + 1);
                        query_input = query_input.slice(0, indexOfDash - 1);
                    }
                    loadMunEstablishments(query_input, query_version, mun, county);
                }
                break;
        }
    });

    // Autocomplete
    loadAutoComplete();
    // Dropdowns for Advanced search and editModal
    loadDropdown();

    //Button listener to show statisticsContainer
    $(".statisticsContainer").click(() => {
        if (LessThan17inch) {
            $(".statisticsContainer").toggleClass("open2");
        } else {
            $(".statisticsContainer").toggleClass("open");
        }
    });

    //Button listener to show advancedSearchContainer
    $(".advancedSearchContainerButton").click(() => {
        $(".advancedSearchContainer").toggleClass("open");
        $("#search-message").hide();
        loadAdvancedSearchListener();
    });

    //Button listener to hide infoContainer
    $(".infoContainerButton").click(() => {
        $(".infoContainer").toggleClass("closed");
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

function loadAdvancedSearchListener() {
    $("#salesvolume-dropdown a").click(function (e) {
        $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
    });

    d3.select('#advsearch-button').on('click', (e) => {
        let industry = $("#industriesId").val();
        let minempl = $("#min-emplsize").val();
        let maxempl = $("#max-emplsize").val();
        let county_name = $("#countyId").val();
        let mpo_name = $("#mpoId").val();
        let mun_name = $("#munId").val(),
            mun_type, mun_county;

        let indexOfDash = mun_name.indexOf('-');
        if (indexOfDash !== -1) {
            let type = mun_name.slice(indexOfDash + 2);
            mun_type = type.slice(0, type.indexOf('/'));
            mun_county = type.slice(type.indexOf('/') + 1);
            mun_name = mun_name.slice(0, indexOfDash - 1);
        }

        let salvol;
        let salvoltext = $('#dropdownSalesVolume').text().trim();
        if (salvoltext !== 'Sales Volume') salvol = salvoltext;

        let query_version = d3.select('#adv-search-version-dropdown').property("value");
        // console.log("County: " + county);
        // console.log("MPO: " + mpo);
        // console.log("Mun: " + mun);
        // console.log("Mun Type: " + mun_type);
        // console.log("Mun County: " + mun_county);

        loadAdvancedSearchEstablishments(industry, minempl, maxempl, salvol, county_name, mpo_name, mun_name, mun_type, mun_county, query_version);
        $(".advancedSearchContainer").toggleClass("open");
    });
}