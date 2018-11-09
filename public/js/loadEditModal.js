// Entity Edit Modal Form
function loadEditModal(dt_row) { 

    if (!dt_row['id'] || dt_row['id'] === '') {
        console.log(dt_row);
        return;
    }
    
    // loadData("#NAICSDS", "getindustries"); //needs to be changed to use autoComplete_url
    //END OF TEST ******************************************************

    let business_id = dt_row["id"];
    let reqURL = '/api/byid/' + business_id;
    d3.json(reqURL)
        .then(data => {
            let est = data.data[0];
            $("#modalLabel").html(est.CONAME + ' - ID: <span id ="business_id">' + business_id + '</span>');
            $("#modal_LEMPSZCD_button").text((est.LEMPSZCD !== null) ? est.LEMPSZCD : 'Emp Size');
            $("#modal_LEMPSZDS").val(est.LEMPSZDS);
            $("#modal_ALEMPSZ").val(est.ALEMPSZ);
            $("#modal_NAICSCD").val(est.NAICSCD);
            $("#modal_NAICSDS").val(est.NAICSDS);
            $("#modal_PRMSICCD").val(est.PRMSICCD);
            $("#modal_PRMSICDS").val(est.PRMSICDS);

            $("#modal_SQFOOTCD_button").text((est.SQFOOTCD !== null) ? est.SQFOOTCD : 'SQFOOT Code');
            $("#modal_SQFOOTDS").val(est.SQFOOTDS);

            $("#modal_LSALVOLCD_button").text((est.LSALVOLCD !== null) ? est.LSALVOLCD : 'Sales Volume');
            $("#modal_LSALVOLDS").val(est.LSALVOLDS);
            $("#modal_ALSLSVOL").val(est.ALSLSVOL);

            $("#modal_CSALVOLCD").val(est.CSALVOLDS);
            $("#modal_CSALVOLDS").val(est.CSALVOLDS);
            $("#modal_ACSLSVOL").val(est.ACSLSVOL);

        }, function (err) {
            alert("Query Error on ID");
            console.log(err);
        });

    loadEditModal_eventListeners();
}
function loadEditModal_eventListeners(){
    $("#modal_LSALVOLCD a").click(function () {
        let str = $(this).text();
        let chosen_LSALVOLCD, chosen_LSALVOLDS;
        let indexOfDash = str.indexOf('-');
        if (indexOfDash !== -1) {
            chosen_LSALVOLCD = str.slice(0, indexOfDash - 1);
            chosen_LSALVOLDS = str.slice(indexOfDash + 2);
        }
        $(this).parents(".dropdown").find('.btn').html(chosen_LSALVOLCD + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        $('#modal_LSALVOLDS').val(chosen_LSALVOLDS);
        $("#modal_ALSLSVOL").val('');
    });

    $("#modal_LEMPSZCD a").click(function () {
        let str = $(this).text();
        let chosen_LEMPSZCD, chosen_LEMPSZDS;
        let indexOfDash = str.indexOf('-');
        if (indexOfDash !== -1) {
            chosen_LEMPSZCD = str.slice(0, indexOfDash - 1);
            chosen_LEMPSZDS = str.slice(indexOfDash + 2);
        }
        $(this).parents(".dropdown").find('.btn').html(chosen_LEMPSZCD + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        $('#modal_LEMPSZDS').val(chosen_LEMPSZDS);
        $("#modal_ALEMPSZ").val('');
    });

    $("#modal_SQFOOTCD a").click(function () {
        let str = $(this).text();
        let chosen_SQFOOTCD, chosen_SQFOOTDS;
        let indexOfDash = str.indexOf('-');
        if (indexOfDash !== -1) {
            chosen_SQFOOTCD = str.slice(0, indexOfDash - 1);
            chosen_SQFOOTDS = str.slice(indexOfDash + 2);
        }
        $(this).parents(".dropdown").find('.btn').html(chosen_SQFOOTCD + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        $('#modal_SQFOOTDS').val(chosen_SQFOOTDS);
    });

    $('#modal_ALEMPSZ').change(()=>{
        //TODO: parse entry
        console.log('ALEMPSZ change');
    });
    $('#modal_ALSLSVOL').change(()=>{
        //TODO: parse entry
        console.log('ALSLSVOL change');
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
*/