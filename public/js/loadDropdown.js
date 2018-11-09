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
    let dropdown = document.getElementById("modal_LSALVOLCD");
    let dropdown_advSearch = document.getElementById("salesvolume-dropdown");
    $("#modal_LSALVOLCD").empty();
    $("#salesvolume-dropdown").empty();
    dropdown.innerHTML = input.data.map(est => {
        if (est.LSALVOLCD !== null) return `<li><a class='dropdown-item' href='#'>${est.LSALVOLCD} - ${est.LSALVOLDS}</a></li>`;
    }).join("");

    dropdown_advSearch.innerHTML = input.data.map(est => `<a class='dropdown-item' href='#'>${est.LSALVOLDS}</a>`).join("");

    //Adv Search
    // dropdown = document.getElementById("salesvolume-dropdown");
    // $("#salesvolume-dropdown").empty();
    // dropdown.innerHTML = input.data.map(est => {
    //     if (est.LSALVOLCD !== null) return `<li><a class='dropdown-item' href='#'>${est.LSALVOLCD} - ${est.LSALVOLDS}</a></li>`;
    // }).join("");
}

function loadDropdown_EmpSize(input) {
    // Edit Modal
    let dropdown = document.getElementById("modal_LEMPSZCD");
    $("#modal_LEMPSZCD").empty();
    dropdown.innerHTML = input.data.map(est => {
        if (est.LSALVOLCD !== null) return `<li><a class='dropdown-item' href='#'>${est.LEMPSZCD} - ${est.LEMPSZDS}</a></li>`;
    }).join("");
}

function loadDropdown_SqFoot(input) {
    // Edit Modal
    let dropdown = document.getElementById("modal_SQFOOTCD");
    $("#modal_SQFOOTCD").empty();
    dropdown.innerHTML = input.data.map(est => {
        if (est.LSALVOLCD !== null) return `<li><a class='dropdown-item' href='#'>${est.SQFOOTCD} - ${est.SQFOOTDS}</a></li>`;
    }).join("");
}
