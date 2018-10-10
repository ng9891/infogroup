// This function will take the parement 'type' and adds it to the URL for a GET request to get a list for the autocomplete feature.
// Expected input: a string that creates a valid API URL with the param 'type'. eg. 'zip' -> getzip route, 'county'->getcounty route
// Output: An expected list of autocompletion displayed below '#query-search' input box
function autoComplete_url(type) {
    // query_input = d3.select('#query-search').property("value");
    // query_input = query_input.trim();

    $("#query-search").autocomplete({
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
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}