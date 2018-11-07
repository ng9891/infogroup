// Entity Edit Modal Form
function loadEditModal(dt_row) {
    if ($.isEmptyObject({
            dt_row
        }) && typeof dt_row == 'undefined') {
        console.log("Datatable row is undefined or empty");
        return;
    }

    d3.json(`/api/getsalesvolume`).then(data => {
        loadSalesVolume(data); //function in file
    }, function (err) {
        alert("Query Error");
        console.log(err);
    });

    d3.json(`/api/getempsize`).then(data => {
        loadEmpSize(data); //function in file
    }, function (err) {
        alert("Query Error");
        console.log(err);
    });

    d3.json(`/api/getsqfoot`).then(data => {
        loadSqFoot(data); //function in file
    }, function (err) {
        alert("Query Error");
        console.log(err);
    });

    //TEST
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
        var arr_data_ds = [];
        var arr_data_cd = [];
        switch (controller) {
            case "getindustries":
                dataValues.data.map(est => {
                    arr_data_ds.push(est.NAICSDS);
                    arr_data_cd.push(est.NAICSCD.toString());
                });
                // console.log(arr_data_cd);
            break;
        }
        $(inputId).autocomplete({
            delay: 0,
            minLength: 2,
            //source: arr_data,
            source: function (request, response) {
                var results = $.ui.autocomplete.filter(arr_data_ds, request.term);
                response(results.slice(0, 10));
            },
            messages: {
                noResults: '',
                results: function () {}
            }
        });
        $('#NAICSCD').autocomplete({
            delay: 0,
            minLength: 2,
            //source: arr_data,
            source: function (request, response) {
                var results2 = $.ui.autocomplete.filter(arr_data_cd, request.term);
                response(results2.slice(0, 10));
            },
            messages: {
                noResults: '',
                results: function () {}
            }
        });
    };
    loadData("#NAICSDS", "getindustries"); //needs to be changed to use autoComplete_url
    //END OF TEST
    
    let business_id = dt_row["id"];
    let reqURL = '/api/byid/' + business_id;
    d3.json(reqURL)
        .then(data => {
            let est = data.data[0];
            $("#modalLabel").html(est.CONAME + ' - ID: <span id ="business_id">' + business_id + '</span>');
            $("#LEMPSZCD_button").text((est.LEMPSZCD !== null) ? est.LEMPSZCD : 'Emp Size');
            $("#LEMPSZDS").val(est.LEMPSZDS);
            $("#ALEMPSZ").val(est.ALEMPSZ);
            $("#NAICSCD").val(est.NAICSCD);
            $("#NAICSDS").val(est.NAICSDS);
            $("#PRMSICCD").val(est.PRMSICCD);
            $("#PRMSICDS").val(est.PRMSICDS);
            $("#SQFOOTCD_button").text((est.SQFOOTCD !== null) ? est.SQFOOTCD : 'SQFOOT Code');
            $("#SQFOOTDS").val(est.SQFOOTDS);
            $("#LSALVOLCD_button").text((est.LSALVOLCD !== null) ? est.LSALVOLCD : 'Sales Volume');
            $("#LSALVOLDS").val(est.LSALVOLDS);
            $("#ALSLSVOL").val(est.ALSLSVOL);
            $("#CSALVOLDS").val(est.CSALVOLDS);
            $("#ACSLSVOL").val(est.ACSLSVOL);

        }, function (err) {
            alert("Query Error on ID");
            console.log(err);
        });
}
function loadSalesVolume(input) {
    let dropdown = document.getElementById("LSALVOLCD");
    $("#LSALVOLCD").empty();
    dropdown.innerHTML = input.data.map(est => {
        if(est.LSALVOLCD !== null) return `<a class='dropdown-item' href='#'>${est.LSALVOLCD} - ${est.LSALVOLDS}</a>`;
    }).join("");

    $("#LSALVOLCD a").click(function () {
        let str = $(this).text();
        let chosen_LSALVOLCD, chosen_LSALVOLDS;
        let indexOfDash = str.indexOf('-');
        if(indexOfDash !== -1){
            chosen_LSALVOLCD = str.slice(0, indexOfDash-1);
            chosen_LSALVOLDS = str.slice(indexOfDash+2);
        }
        $(this).parents(".dropdown").find('.btn').html(chosen_LSALVOLCD + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        $('#LSALVOLDS').val(chosen_LSALVOLDS);
        $("#ALSLSVOL").val('');
    });
}
function loadEmpSize(input) {
    let dropdown = document.getElementById("LEMPSZCD");
    $("#LEMPSZCD").empty();
    dropdown.innerHTML = input.data.map(est => {
        if(est.LSALVOLCD !== null) return `<a class='dropdown-item' href='#'>${est.LEMPSZCD} - ${est.LEMPSZDS}</a>`;
    }).join("");

    $("#LEMPSZCD a").click(function () {
        let str = $(this).text();
        let chosen_LEMPSZCD, chosen_LEMPSZDS;
        let indexOfDash = str.indexOf('-');
        if(indexOfDash !== -1){
            chosen_LEMPSZCD = str.slice(0, indexOfDash-1);
            chosen_LEMPSZDS = str.slice(indexOfDash+2);
        }
        $(this).parents(".dropdown").find('.btn').html(chosen_LEMPSZCD + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        $('#LEMPSZDS').val(chosen_LEMPSZDS);
        $("#ALEMPSZ").val('');
    });
}
function loadSqFoot(input) {
    let dropdown = document.getElementById("SQFOOTCD");
    $("#SQFOOTCD").empty();
    dropdown.innerHTML = input.data.map(est => {
        if(est.LSALVOLCD !== null) return `<a class='dropdown-item' href='#'>${est.SQFOOTCD} - ${est.SQFOOTDS}</a>`;
    }).join("");

    $("#SQFOOTCD a").click(function () {
        let str = $(this).text();
        let chosen_SQFOOTCD, chosen_SQFOOTDS;
        let indexOfDash = str.indexOf('-');
        if(indexOfDash !== -1){
            chosen_SQFOOTCD = str.slice(0, indexOfDash-1);
            chosen_SQFOOTDS = str.slice(indexOfDash+2);
        }
        $(this).parents(".dropdown").find('.btn').html(chosen_SQFOOTCD + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        $('#SQFOOTDS').val(chosen_SQFOOTDS);
    });
}

// END Entity Edit Modal Form
/*
database records: spatial (add, modify, delete) point feature geometry; 
non-spatial (add, modify, delete) PRIMARY_SIC_CODE; PRIMARY_SIC_DESC; NAICS_CODE; NAICS_DESC; 
ACTUAL_LOCATION_EMPLOYMENT_SIZE; ACTUAL_CORPORATE_EMPLOYMENT_SIZE; MODELED_EMPLOYMENT_SIZE; ACTUAL_LOCATION_SALES_VOLUME; 
ACTUAL_CORPORATE_SALES_VOLUME; SQUARE_FOOTAGE_CODE; LATITUDE; LONGITUDE)

//list
id
business_id
by
record_status
status
PRMSICCD //int
PRMSICDS
NAICSCD //int
NAICSDS
ALEMPSZ //int
ACEMPSZ
LEMPSZCD
LEMPSZSZ
SQFOOTCD
SQFOOTDS
LATITUDEO
LONGITUDEO
created_at
started_at
ended_at
geom
LSALVOLCD
LSALVOLDS
ALSLSVOL //int
CSALVOLCD
CSALVOLDS
ACSLSVOL //int


SQFOOTCD / DS
"A"	"0 - 2499"
"B"	"2500 - 9999"
"C"	"10000 - 39999"
"D"	"40000+"
*/