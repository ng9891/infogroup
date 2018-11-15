function loadAutoComplete(){
    //Declare the AC on ready. Main Page
    $("#query-search").autocomplete();
    $("#query-search").on('input', () => {
        query_type = d3.select('#query-dropdown').property("value");
        switch (query_type) {
            case 'zip':
                autoComplete_url("#query-search", 'zip');
                break;
            case 'county':
                autoComplete_url("#query-search", 'county', 1);
                break;
            case 'mpo':
                autoComplete_url("#query-search", 'mpo', 1);
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

    let obj_naics_arr = [];
    d3.json(`/api/getindustries`).then(data => {
        let obj_naics_cd = {};
        let obj_naics_ds = {};
        let arr_data_cd = [];
        data.data.map((est) => {    
            obj_naics_cd[est.NAICSCD.toString()] = est.NAICSDS;
            obj_naics_ds[est.NAICSDS] = est.NAICSCD.toString();
            arr_data_cd.push(est.NAICSCD.toString());
        });
        obj_naics_arr.push(obj_naics_cd);
        obj_naics_arr.push(obj_naics_ds);
        autoComplete_text(arr_data_cd, '#modal_NAICSCD');
    }, function (err) {
        console.log(err);
    });
    // No repetition of 'industries description' purposes
    d3.json(`/api/getindustries?type='ds'`).then(data => {
        let arr_data_ds = [];
        data.data.map((est) => {    
            arr_data_ds.push(est.NAICSDS);
        });
        autoComplete_text(arr_data_ds, '#modal_NAICSDS');
        autoComplete_text(arr_data_ds, '#industriesId');    //adv search
    }, function (err) {
        console.log(err);
    });

    let obj_sic_arr = [];
    d3.json(`/api/getsic`).then(data => {
        let obj_sic_cd = {};
        let obj_sic_ds = {};
        let arr_data_cd = [];
        let arr_data_ds = [];
        data.data.map((est) => {    
            obj_sic_cd[est.PRMSICCD.toString()] = est.PRMSICDS;
            obj_sic_ds[est.PRMSICDS] = est.PRMSICCD.toString();
            arr_data_cd.push(est.PRMSICCD.toString());
            arr_data_ds.push(est.PRMSICDS);
        });
        obj_sic_arr.push(obj_sic_cd);
        obj_sic_arr.push(obj_sic_ds);
        autoComplete_text(arr_data_cd, '#modal_PRMSICCD');
        autoComplete_text(arr_data_ds, '#modal_PRMSICDS');
    }, function (err) {
        console.log(err);
    });
}

// This function will take the parement 'type' and adds it to the URL for a GET request to get a list for the autocomplete feature.
// Expected input: a string that creates a valid API URL with the param 'column'. eg. 'zip' -> getzip route, 'county'->getcounty route
//                  inputId: string with id of the HTML element to Autocomplete. eg. '#query-search'
//                  minlen: int with minimum length to query database
//                  type: string variable to complete the URL. eg. /api/getsic/test?type='cd'
// Output: An expected list of autocompletion displayed below 'inputId' input box
function autoComplete_url(inputId, column, minlen=2,type='') {
    $(inputId).autocomplete({
        delay: 1000,
        minLength: minlen,
        sortResults: false,
        source: function (request, response) {
            let input = request.term.trim();
            $.ajax({
                type: "GET",
                dataType: 'json',
                url: `/api/get${column}/${encodeURIComponent(input)}?type='${type}'`,
                success: function (data) {
                    if (data) {
                        let arr_data = [];
                        data.data.map((d) => {
                            if(d.muni_type){
                                d.name += ' - ' + capitalizeFirstLetter(d.muni_type) + '/' + capitalizeFirstLetter(d.county);
                            }
                            arr_data.push(`${d.name}`);
                            if(d.abbrv) arr_data.push(d.abbrv); // Abbreviation and name query AC for MPO
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
        sortResults: false,
        source: function (request, response) {
            var results = $.ui.autocomplete.filter(data, request.term);
            response(results.slice(0, 15));
        },
        messages: {
            noResults: '',
            results: function () {}
        }
    });
};
 // Overrides the default autocomplete filter function to search only from the beginning of the string
 $.ui.autocomplete.filter = function (array, term) {
    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
    return $.grep(array, function (value) {
            return matcher.test(value.label || value.value || value);
    });
};
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}