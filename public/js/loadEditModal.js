// Entity Edit Modal Form
function loadEditModal(dt_row) { 

    if (!dt_row['id'] || dt_row['id'] === '') {
        console.log(dt_row);
        return;
    }
    
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

            $("#modal_CSALVOLCD_button").text((est.CSALVOLCD !== null) ? est.CSALVOLCD : 'Corporate Sales Volume');
            $("#modal_CSALVOLDS").val(est.CSALVOLDS);
            $("#modal_ACSLSVOL").val(est.ACSLSVOL);

        }, function (err) {
            alert("Query Error on ID");
            console.log(err);
        });

    loadEditModal_eventListeners();
}
function loadEditModal_eventListeners(){
    var form = $('#modal-form');
    form.on('submit',(e)=>{
        console.log('submitted');
        if (form[0].checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
          }
          form[0].classList.add('was-validated');
        // sendBusinessEdit();
        e.preventDefault();
    });

    $('#submit_modal').click(()=>{
        $('#modal-form').submit();
    });

    // Close modal listener. Turn form to novalidate
    $('#editModal').on('hidden.bs.modal', function() {
        var form = $('#modal-form');
        form[0].classList.remove('was-validated');
    });


    $("#modal_LSALVOLCD li").click(function () {
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
        // $("#modal_ALSLSVOL").val('');
    });

    $("#modal_LEMPSZCD li").click(function () {
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
        // $("#modal_ALEMPSZ").val('');
    });

    $("#modal_SQFOOTCD li").click(function () {
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

    $("#modal_CSALVOLCD li").click(function () {
        let str = $(this).text();
        let chosen_CSALVOLCD, chosen_CSALVOLDS;
        let indexOfDash = str.indexOf('-');
        if (indexOfDash !== -1) {
            chosen_CSALVOLCD = str.slice(0, indexOfDash - 1);
            chosen_CSALVOLDS = str.slice(indexOfDash + 2);
        }
        $(this).parents(".dropdown").find('.btn').html(chosen_CSALVOLCD + ' <span class="caret"></span>');
        $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
        $('#modal_CSALVOLDS').val(chosen_CSALVOLDS);
    });

    $('#modal_ALEMPSZ').change(selectRange_ALEMPSZ);
    $('#modal_ALSLSVOL').change(selectRange_ALSLSVOL);
}

function selectRange_ALEMPSZ(){
    //TODO: parse entry
    let empszInput = $('#modal_ALEMPSZ').val().trim();
    empszInput = parseInt(empszInput, 10);
    if (isNaN(empszInput) ) {
        console.log('nan')
        return;
    }
    if(empszInput<1){
        console.log('<1')
        return;
    }
    if(isBetween(empszInput, 1, 4)){
        $('#modal_LEMPSZCD li[value="A"]').click();
    }else if(isBetween(empszInput, 5, 9)){
        $('#modal_LEMPSZCD li[value="B"]').click();
    }else if(isBetween(empszInput, 10, 19)){
        $('#modal_LEMPSZCD li[value="C"]').click();
    }else if(isBetween(empszInput, 20, 49)){
        $('#modal_LEMPSZCD li[value="D"]').click();
    }else if(isBetween(empszInput, 50, 99)){
        $('#modal_LEMPSZCD li[value="E"]').click();
    }else if(isBetween(empszInput, 100, 249)){
        $('#modal_LEMPSZCD li[value="F"]').click();
    }else if(isBetween(empszInput, 250, 499)){
        $('#modal_LEMPSZCD li[value="G"]').click();
    }else if(isBetween(empszInput, 500, 999)){
        $('#modal_LEMPSZCD li[value="H"]').click();
    }else if(isBetween(empszInput, 1000, 4999)){
        $('#modal_LEMPSZCD li[value="I"]').click();
    }else if(isBetween(empszInput, 5000, 9999)){
        $('#modal_LEMPSZCD li[value="J"]').click();
    }else {
        $('#modal_LEMPSZCD li[value="K"]').click();
    }
}
function selectRange_ALSLSVOL(){
    //TODO: parse entry
    let slsvolInput = $('#modal_ALSLSVOL').val().trim();
    slsvolInput = parseInt(slsvolInput, 10);
    if (isNaN(slsvolInput)) {
        console.log('nan');
        return;
    }
    if(slsvolInput<1){
        console.log('<1')
        return;
    }
    console.log(slsvolInput);
    if(isBetween(slsvolInput, 1, 499)){
        $('#modal_LSALVOLCD li[value="A"]').click();
    }else if(isBetween(slsvolInput, 500, 999)){
        $('#modal_LSALVOLCD li[value="B"]').click();
    }else if(isBetween(slsvolInput, 1000, 2499)){
        $('#modal_LSALVOLCD li[value="C"]').click();
    }else if(isBetween(slsvolInput, 2500, 4999)){
        $('#modal_LSALVOLCD li[value="D"]').click();
    }else if(isBetween(slsvolInput, 5000, 9999)){
        $('#modal_LSALVOLCD li[value="E"]').click();
    }else if(isBetween(slsvolInput, 10000, 19999)){
        $('#modal_LSALVOLCD li[value="F"]').click();
    }else if(isBetween(slsvolInput, 20000, 49999)){
        $('#modal_LSALVOLCD li[value="G"]').click();
    }else if(isBetween(slsvolInput, 50000, 99999)){
        $('#modal_LSALVOLCD li[value="H"]').click();
    }else if(isBetween(slsvolInput, 100000, 499999)){
        $('#modal_LSALVOLCD li[value="I"]').click();
    }else if(isBetween(slsvolInput, 500000, 999999)){
        $('#modal_LSALVOLCD li[value="J"]').click();
    }else {
        $('#modal_LSALVOLCD li[value="K"]').click();
    }
}
function isBetween(x, min, max) {
    return x >= min && x <= max;
}

// Boiler plate to check. 
// function check_boilerplate(){
//     console.log('change');
    
//     // this.setCustomValidity(""); // sets it Valid
//     // this.setCustomValidity("anything"); // sets it invalid
//     let msg= 'Please provide a valid Employment Size.';
//     let reason = this.validity;
//     if (reason.patternMismatch) {
//         msg = 'pattern missmatch';
//     }
//     else if(isInvalid()){
//         // check if it fall between code range
//         this.setCustomValidity("wrong");
//         msg = 'wrong';
//     }
//     this.nextElementSibling.innerText= msg; // Next div with error message
// }


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