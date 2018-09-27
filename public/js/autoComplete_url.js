function autoComplete_url(type) {
    // query_input = d3.select('#query-search').property("value");
    // query_input = query_input.trim();

    let arr_data2 = [];
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
                        data.data.map((d) => {
                            arr_data2.push(d.name);
                            if(d.abbrv) arr_data2.push(d.abbrv);
                        });
                        var results = $.ui.autocomplete.filter(arr_data2, input);
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