function sendBusinessEdit() {
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
        PRMSICCD: isEmpty($("#modal_PRMSICCD").val()) ? null: $("#modal_PRMSICCD").val(),
        PRMSICDS: isEmpty($("#modal_PRMSICDS").val()) ? null : `'${$("#modal_PRMSICDS").val()}'`,
        NAICSCD: isEmpty($("#modal_NAICSCD").val()) ? null : $("#modal_NAICSCD").val(),
        NAICSDS: isEmpty($("#modal_NAICSDS").val()) ? null: `'${$("#modal_NAICSDS").val()}'`,
        ALEMPSZ: isEmpty($("#modal_ALEMPSZ").val()) ? null : $("#modal_ALEMPSZ").val(),
        ACEMPSZ: null,
        LEMPSZCD: isEmpty($("#modal_LEMPSZCD").val()) ? null : `'${$("#modal_LEMPSZCD").val()}'`,
        LEMPSZSZ: null,
        SQFOOTCD: isEmpty($("#modal_SQFOOTCD").val()) ? null : `'${$("#modal_SQFOOTCD").val()}'`,
        SQFOOTDS: isEmpty($("#modal_SQFOOTDS").val()) ? null : `'${$("#modal_SQFOOTDS").val()}'`,
        LATITUDEO: null,
        LONGITUDEO: null,
        geom: null,
        LSALVOLCD: isEmpty($("#modal_LSALVOLCD").val()) ? null : `'${$("#modal_LSALVOLCD").val()}'`,
        LSALVOLDS: isEmpty($("#modal_LSALVOLDS").val()) ? null : `'${$("#modal_LSALVOLDS").val()}'`,
        ALSLSVOL: isEmpty($("#modal_ALSLSVOL").val()) ? null : $("#modal_ALSLSVOL").val(),
        CSALVOLCD: null,
        CSALVOLDS: null,
        ACSLSVOL: isEmpty($("#modal_ACSLSVOL").val()) ? null : `'${$("#modal_ACSLSVOL").val()}'`
    }
    return obj;
}

function isEmpty(txt){
    if(!txt) return true;   //undefined
    if(txt === '') return true; //empty
    return false;
}