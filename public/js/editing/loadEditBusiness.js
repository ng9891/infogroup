function loadEditBusiness() {
    let business_id = $("#business_id").text();
    let form = getForm();
    d3.json(`/${business_id}`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(() =>{
        alert('Sent for approval');
        $("#byemodal").click();
        
    }, function (err) {
        alert("Error in submission");
        console.log(err);
    });
}

function getForm() {
    //TODO: CHECK FOR EMPTY STRING, UPPERCASE and trim
    //TODO: GEOM PARSING
    let obj = {};
    obj = {
        PRMSICCD: isEmpty($("#PRMSICCD").val()) ? null: $("#PRMSICCD").val(),
        PRMSICDS: isEmpty($("#PRMSICDS").val()) ? null : `'${$("#PRMSICDS").val()}'`,
        NAICSCD: isEmpty($("#NAICSCD").val()) ? null : $("#NAICSCD").val(),
        NAICSDS: isEmpty($("#NAICSDS").val()) ? null: `'${$("#NAICSDS").val()}'`,
        ALEMPSZ: isEmpty($("#ALEMPSZ").val()) ? null : $("#ALEMPSZ").val(),
        ACEMPSZ: null,
        LEMPSZCD: isEmpty($("#LEMPSZCD").val()) ? null : `'${$("#LEMPSZCD").val()}'`,
        LEMPSZSZ: null,
        SQFOOTCD: isEmpty($("#SQFOOTCD").val()) ? null : `'${$("#SQFOOTCD").val()}'`,
        SQFOOTDS: isEmpty($("#SQFOOTDS").val()) ? null : `'${$("#SQFOOTDS").val()}'`,
        LATITUDEO: null,
        LONGITUDEO: null,
        geom: null,
        LSALVOLCD: isEmpty($("#LSALVOLCD").val()) ? null : `'${$("#LSALVOLCD").val()}'`,
        LSALVOLDS: isEmpty($("#LSALVOLDS").val()) ? null : `'${$("#LSALVOLDS").val()}'`,
        ALSLSVOL: isEmpty($("#ALSLSVOL").val()) ? null : $("#ALSLSVOL").val(),
        CSALVOLCD: null,
        CSALVOLDS: null,
        ACSLSVOL: isEmpty($("#ACSLSVOL").val()) ? null : `'${$("#ACSLSVOL").val()}'`
    }
    return obj;
}

function isEmpty(txt){
    if(!txt) return true;   //undefined
    if(txt === '') return true; //empty
    return false;
}