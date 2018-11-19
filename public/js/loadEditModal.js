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

function loadEditModal_eventListeners() {
    var form = $('#modal-form');
    form.on('submit', (e) => {
        form[0].classList.add('was-validated');
        if (form[0].checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
        }else if(form[0].checkValidity() === true){
            sendBusinessEdit();
            e.preventDefault();
        }
    });

    $('#submit_modal').click(() => {
        $('#modal-form').submit();
    });

    // Close modal listener. Turn form to novalidate
    $('#editModal').on('hidden.bs.modal', function () {
        var form = $('#modal-form');
        // Reset Custom validity on close
        $('#modal_ALEMPSZ')[0].setCustomValidity("");
        $('#modal_ALSLSVOL')[0].setCustomValidity("");
        $('#modal_ACSLSVOL')[0].setCustomValidity("");
        form[0].classList.remove('was-validated');
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
        // Check the range for actual employment size
        checkRangeEmply(chosen_LEMPSZDS);
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
        // Check the range for actual sales volume
        checkRangeSales('#modal_LSALVOLCD', chosen_LSALVOLCD);
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
        // Check the range for actual sales volume
        checkRangeSales('#modal_CSALVOLCD', chosen_CSALVOLCD);
    });

    $('#modal_ALEMPSZ').change(selectRange_ALEMPSZ);
    $('#modal_ALSLSVOL').change(selectRange);
    $('#modal_ACSLSVOL').change(selectRange);

    $('#modal_NAICSCD').change(autoFillText);
    $('#modal_NAICSDS').change(autoFillText);

    $('#modal_PRMSICCD').change(autoFillText);
    $('#modal_PRMSICDS').change(autoFillText);
}

function selectRange_ALEMPSZ() {
    let empszInput = $('#modal_ALEMPSZ').val().trim();
    empszInput = parseInt(empszInput, 10);
    if (isBetween(empszInput, 1, 4)) {
        $('#modal_LEMPSZCD li[value="A"]').click();
    } else if (isBetween(empszInput, 5, 9)) {
        $('#modal_LEMPSZCD li[value="B"]').click();
    } else if (isBetween(empszInput, 10, 19)) {
        $('#modal_LEMPSZCD li[value="C"]').click();
    } else if (isBetween(empszInput, 20, 49)) {
        $('#modal_LEMPSZCD li[value="D"]').click();
    } else if (isBetween(empszInput, 50, 99)) {
        $('#modal_LEMPSZCD li[value="E"]').click();
    } else if (isBetween(empszInput, 100, 249)) {
        $('#modal_LEMPSZCD li[value="F"]').click();
    } else if (isBetween(empszInput, 250, 499)) {
        $('#modal_LEMPSZCD li[value="G"]').click();
    } else if (isBetween(empszInput, 500, 999)) {
        $('#modal_LEMPSZCD li[value="H"]').click();
    } else if (isBetween(empszInput, 1000, 4999)) {
        $('#modal_LEMPSZCD li[value="I"]').click();
    } else if (isBetween(empszInput, 5000, 9999)) {
        $('#modal_LEMPSZCD li[value="J"]').click();
    } else if (isBetween(empszInput, 10000, Infinity)) {
        $('#modal_LEMPSZCD li[value="K"]').click();
    }
    checkRangeEmply($('#modal_LEMPSZDS').val());
}

function selectRange(e) {
    let element = e.target.id;
    let queryType = element.slice(6); // Takes out 'modal_'
    let slsvolInput;
    let targetElement;
    switch (queryType) {
        case 'ALSLSVOL':
            slsvolInput = $('#modal_ALSLSVOL').val().trim();
            slsvolInput = parseInt(slsvolInput, 10);
            targetElement = '#modal_LSALVOLCD';
            break;
        case 'ACSLSVOL':
            slsvolInput = $('#modal_ACSLSVOL').val().trim();
            slsvolInput = parseInt(slsvolInput, 10);
            targetElement = '#modal_CSALVOLCD';
            break;
    }
    if (isBetween(slsvolInput, 1, 499)) {
        $(targetElement + ' li[value="A"]').click();
    } else if (isBetween(slsvolInput, 500, 999)) {
        $(targetElement + ' li[value="B"]').click();
    } else if (isBetween(slsvolInput, 1000, 2499)) {
        $(targetElement + ' li[value="C"]').click();
    } else if (isBetween(slsvolInput, 2500, 4999)) {
        $(targetElement + ' li[value="D"]').click();
    } else if (isBetween(slsvolInput, 5000, 9999)) {
        $(targetElement + ' li[value="E"]').click();
    } else if (isBetween(slsvolInput, 10000, 19999)) {
        $(targetElement + ' li[value="F"]').click();
    } else if (isBetween(slsvolInput, 20000, 49999)) {
        $(targetElement + ' li[value="G"]').click();
    } else if (isBetween(slsvolInput, 50000, 99999)) {
        $(targetElement + ' li[value="H"]').click();
    } else if (isBetween(slsvolInput, 100000, 499999)) {
        $(targetElement + ' li[value="I"]').click();
    } else if (isBetween(slsvolInput, 500000, 999999)) {
        $(targetElement + ' li[value="J"]').click();
    } else if (isBetween(slsvolInput, 1000000, Infinity)) {
        $(targetElement + ' li[value="K"]').click();
    } else {
        checkRangeSales(targetElement, $(targetElement + '_button').text());
    }
}

function autoFillText(e) {
    let element = e.target.id;
    let queryType = element.slice(6, -2); // Takes out 'modal_' and last 2 chars
    let type = element.substr(-2); // Gets CD or DS
    let arr = [];
    let change_element; // Element to autofill
    let input;
    switch (queryType) {
        case 'NAICS':
            input = $('#' + element).val();
            if (type === 'CD') {
                arr = _obj_naics_arr[0];
                change_element = '#modal_NAICSDS';
            }
            if (type === 'DS') {
                arr = _obj_naics_arr[1];
                change_element = '#modal_NAICSCD';
            }
            if (arr[input]) $(change_element).val(arr[input]);
            break;
        case 'PRMSIC':
            input = $('#' + element).val();
            if (type === 'CD') {
                arr = _obj_sic_arr[0];
                change_element = '#modal_PRMSICDS';
            }
            if (type === 'DS') {
                arr = _obj_sic_arr[1];
                change_element = '#modal_PRMSICCD';
            }
            if (arr[input]) $(change_element).val(arr[input]);
            break;
    }
}

function checkRangeEmply(range) {
    let indexOfDash = range.indexOf('-');
    let min = range.slice(0, indexOfDash);
    let max = range.slice(indexOfDash + 1);
    let input = $(modal_ALEMPSZ).val();
    let msg;

    if (min === '10000') max = Infinity;
    if ($('#modal_ALEMPSZ')[0].validity.patternMismatch) {
        $('#modal_ALEMPSZ')[0].setCustomValidity("mismatch");
        msg = 'Please provide a valid employment Size';
        $('#modal_ALEMPSZ')[0].nextElementSibling.innerText = msg; // Next div with error message
    } else if (!isBetween(+input, +min, +max) && input) {
        $('#modal_ALEMPSZ')[0].setCustomValidity("not in range");
        msg = 'Please provide an Actual Size within range';
        $('#modal_ALEMPSZ')[0].nextElementSibling.innerText = msg; // Next div with error message
    } else {
        // Validation works or field is empty
        $('#modal_ALEMPSZ')[0].setCustomValidity("");
    }
}

function checkRangeSales(element, code) {
    let input, checkElement;
    let min, max, msg;
    let queryType = element.slice(7, -2); // Takes out '#modal_' and last 2 chars
    switch (queryType) {
        case 'LSALVOL':
            checkElement = '#modal_ALSLSVOL';
            input = $(checkElement).val();
            break;
        case 'CSALVOL':
            checkElement = '#modal_ACSLSVOL';
            input = $(checkElement).val();
            break;
    }
    switch (code) {
        case 'A':
            min = 1;
            max = 499;
            break;
        case 'B':
            min = 500;
            max = 999;
            break;
        case 'C':
            min = 1000;
            max = 2499;
            break;
        case 'D':
            min = 2500;
            max = 4999;
            break;
        case 'E':
            min = 5000;
            max = 9999;
            break;
        case 'F':
            min = 10000;
            max = 19999;
            break;
        case 'G':
            min = 20000;
            max = 49999;
            break;
        case 'H':
            min = 50000;
            max = 99999;
            break;
        case 'I':
            min = 100000;
            max = 499999;
            break;
        case 'J':
            min = 500000;
            max = 999999;
            break;
        case 'K':
            min = 1000000;
            max = Infinity;
            break;
    }
    if ($(checkElement)[0].validity.patternMismatch) {
        $(checkElement)[0].setCustomValidity("mismatch");
        msg = 'Please provide a valid Sales Volume';
        $(checkElement)[0].nextElementSibling.innerText = msg; // Next div with error message
    } else if (!isBetween(+input, min, max) && input) {
        $(checkElement)[0].setCustomValidity("not in range");
        msg = 'Please provide a Sales Volume within range. Input = ' + toCommas(input + '000');
        $(checkElement)[0].nextElementSibling.innerText = msg; // Next div with error message
    } else {
        // Validation works or field is empty
        $(checkElement)[0].setCustomValidity("");
    }

    function toCommas(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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