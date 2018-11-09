function loadAutoComplete(){
    //Declare the AC on ready
    $("#query-search").autocomplete();
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

    // Advance search autocomplete
    autoComplete_url("#countyId", 'county');
    autoComplete_url("#mpoId", 'mpo');
    autoComplete_url("#munId", 'mun');
    // TEST *********************************************
    let obj_industries = {};
    d3.json(`/api/getindustries`).then(data => {
        let arr_data_cd = [];
        data.data.map((est) => {    
            obj_industries[est.NAICSCD.toString()] = est.NAICSDS;
            arr_data_cd.push(est.NAICSCD.toString());
        });
        autoComplete_text(arr_data_cd, '#modal_NAICSCD');
    }, function (err) {
        console.log(err);
    });
    // No repetition of 'industries description' purposes
    d3.json(`/api/getindustries?type=ds`).then(data => {
        let arr_data_ds = [];
        data.data.map((est) => {    
            arr_data_ds.push(est.NAICSDS);
        });
        autoComplete_text(arr_data_ds, '#modal_NAICSDS');
        autoComplete_text(arr_data_ds, '#industriesId');    //adv search
    }, function (err) {
        console.log(err);
    });
}

// This function will take the parement 'type' and adds it to the URL for a GET request to get a list for the autocomplete feature.
// Expected input: a string that creates a valid API URL with the param 'type'. eg. 'zip' -> getzip route, 'county'->getcounty route
// Output: An expected list of autocompletion displayed below '#query-search' input box
function autoComplete_url(inputId, type) {
    // query_input = d3.select('#query-search').property("value");
    // query_input = query_input.trim();
    $(inputId).autocomplete({
        delay: 1000,
        minLength: 2,
        source: function (request, response) {
            let input = request.term.trim();
            $.ajax({
                type: "GET",
                dataType: 'json',
                url: '/api/get' + type + '/' + encodeURIComponent(input),
                success: function (data) {
                    if (data) {
                        let arr_data = [];
                        data.data.map((d) => {
                            if(d.muni_type){
                                d.name += ' - ' + capitalizeFirstLetter(d.muni_type) + '/' + capitalizeFirstLetter(d.county);
                            }
                            arr_data.push(d.name);
                            if(d.abbrv) arr_data.push(d.abbrv);
                        });
                        var results = $.ui.autocomplete.filter(arr_data, input);
                        response(results.slice(0, 15));
                    }
                }
            });
        },
        messages: {
            noResults: '',
            results: function () {}
        }
    });
}

function autoComplete_text(data, inputId) {
    $(inputId).autocomplete({
        delay: 0,
        minLength: 2,
        //source: arr_data,
        source: function (request, response) {
            var results = $.ui.autocomplete.filter(data, request.term);
            response(results.slice(0, 10));
        },
        messages: {
            noResults: '',
            results: function () {}
        }
    });
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}