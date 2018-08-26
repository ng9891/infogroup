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
//---
// END EVENT LISTENERS
//---


//------------------------------------------------------------------------------
// TEST for nav bar search
$(document).ready(function() {
    $('#query-search').keydown(function(event){
      if(event.keyCode == 13) {
        event.preventDefault();
        $('#query-button').click();
      }
    });
    d3.select('#query-button').on('click', (e) => {
        let query_input = d3.select('#query-search').property("value");
        let query_type = d3.select('#query-dropdown').property("value");
    
        switch(query_type){
            case 'zip':
                if (query_input.length !== 5 || isNaN(+query_input)) {
                    alert("Invalid Input");
                } else {
                    loadZipEstablishments(query_input);
                }
                break;
            case 'county':
                if (query_input.length <= 4) {
                    alert("Invalid Input");
                } else {
                    loadCountyEstablishments(query_input);
                }
        }
    });
    d3.select('.county_next-button').on('click', (e) => {
        //TODO: Find a way to save the offset value in a var or URL for offsetting
        //Send the amount of current points for offset
    
        //redirect to /county
        window.location.href = window.location.href + '?offset=0';
    
        // loadCountyEstablishments(value, markers.length);
    });
});

// JS For Advanced Search Form
$(document).ready(function() {

    $("#search-message").hide();

    d3.json(`/api/getindustries`).then(data => {
           loadIndustries(data);
		}, function (err) {
		alert("Query Error");
		console.log(err);
    });

    function loadIndustries(input) {
       
        var arr_data = [];

        input.data.map( est => {
            arr_data.push(est.NAICSDS);
        });

        $( "#tags" ).autocomplete({
            delay: 0,
            minLength: 2,
            //source: arr_data,
            source: function(request, response) {
                var results = $.ui.autocomplete.filter(arr_data, request.term);
                response(results.slice(0, 10));
            },
            messages: {
                noResults: '',
                results: function(){}
            }
        });
    }

    var borough;
    $(".dropdown-menu a").click(function(){
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
