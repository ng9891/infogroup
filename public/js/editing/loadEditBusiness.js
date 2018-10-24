function loadEditBusiness() {
    let business_id = $("#entityId").text();
    let form = getForm();
    d3.json(`/${business_id}`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(data =>{
            alert('Sent for approval');
            $(".editEntity").hide();
        
    }, function (err) {
        alert("Error in submission");
        console.log(err);
    });
}

function getForm() {
    //PARSE LEMPSZCD, SQFOOTCD, LSALVOLCD, CSALVOLCD
    //CHECK FOR EMPTY STRING
    let obj = {};
    obj = {
        PRMSICCD: isEmpty($("#entityPrimarySicId").val()) ? null: $("#entityPrimarySicId").val(),
        PRMSICDS: isEmpty($("#entityPrimarySicDescId").val()) ? null : `'${$("#entityPrimarySicDescId").val()}'`,
        NAICSCD: isEmpty($("#entityNaicsCodeId").val()) ? null : $("#entityNaicsCodeId").val(),
        NAICSDS: isEmpty($("#entityIndustryId").val()) ? null: `'${$("#entityIndustryId").val()}'`,
        ALEMPSZ: null,
        ACEMPSZ: null,
        LEMPSZCD: null,
        LEMPSZSZ: isEmpty($("#entityEmplId").val()) ? null : $("#entityEmplId").val(),
        SQFOOTCD: isEmpty($("#entitySqrFootageId").val()) ? null : `'${$("#entitySqrFootageId").val()}'`,
        SQFOOTDS: null,
        LATITUDEO: null,
        LONGITUDEO: null,
        geom: null,
        LSALVOLCD: null,
        LSALVOLDS: isEmpty($("#entitySalesVolumeId").val()) ? null : `'${$("#entitySalesVolumeId").val()}'`,
        ALSLVOL: null,
        CSALVOLCD: null,
        CSALVOLDS: null,
        ACSLVOL: null
    }
    return obj;
}

function isEmpty(txt){
    if(txt.trim() === '') return true;
    return false;
}