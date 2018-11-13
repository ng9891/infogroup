function loadDropdown() { 
    d3.json(`/api/getsalesvolume`).then(data => {
        loadDropdown_SalesVolume(data); //function in file
    }, function (err) {
        console.log(err);
    });

    d3.json(`/api/getempsize`).then(data => {
        loadDropdown_EmpSize(data); //function in file
    }, function (err) {
        console.log(err);
    });

    d3.json(`/api/getsqfoot`).then(data => {
        loadDropdown_SqFoot(data); //function in file
    }, function (err) {
        console.log(err);
    });
}
function loadDropdown_SalesVolume(input) {
    // Edit Modal
    let modal_salesVol_dropdown = $("#modal_LSALVOLCD");
    let modal_corpSalesVol_dropdown = $("#modal_CSALVOLCD");
    let adv_salesVol_dropdown = $("#salesvolume-dropdown");
    modal_salesVol_dropdown.empty();

    modal_corpSalesVol_dropdown[0].innerHTML = modal_salesVol_dropdown[0].innerHTML = input.data.map(est => {
        if (est.LSALVOLCD !== null) return `<li value=${est.LSALVOLCD}><a class='dropdown-item' href='#'>${est.LSALVOLCD} - ${est.LSALVOLDS}</a></li>`;
    }).join("");

    adv_salesVol_dropdown[0].innerHTML = input.data.map(est => `<a class='dropdown-item' href='#'>${est.LSALVOLDS}</a>`).join("");
}

function loadDropdown_EmpSize(input) {
    // Edit Modal
    let modal_empSZ_dropdown = $("#modal_LEMPSZCD");
    modal_empSZ_dropdown.empty();
    modal_empSZ_dropdown[0].innerHTML = input.data.map(est => {
        if (est.LSALVOLCD !== null) return `<li value=${est.LEMPSZCD}><a class='dropdown-item' href='#'>${est.LEMPSZCD} - ${est.LEMPSZDS}</a></li>`;
    }).join("");
}

function loadDropdown_SqFoot(input) {
    // Edit Modal
    let modal_SQFoot_dropdown = $("#modal_SQFOOTCD");
    modal_SQFoot_dropdown.empty();
    modal_SQFoot_dropdown[0].innerHTML = input.data.map(est => {
        if (est.LSALVOLCD !== null) return `<li value=${est.SQFOOTCD}><a class='dropdown-item' href='#'>${est.SQFOOTCD} - ${est.SQFOOTDS}</a></li>`;
    }).join("");
}
