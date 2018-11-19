function sendBusinessEdit() {
    let business_id = $("#business_id").text();
    let form = getForm();
    console.log(form);
    // d3.json(`/${business_id}`, {
    //     method: "POST",
    //     body: JSON.stringify(form),
    //     headers: {
    //         "Content-type": "application/json; charset=UTF-8"
    //     }
    // }).then(() =>{
    //     alert('Sent for approval');
    //     $("#byemodal").click();
        
    // }, function (err) {
    //     alert("Error in submission");
    //     console.log(err);
    // });
}

function getForm() {
    let obj = {};
    obj = {
        PRMSICCD: parseInput($("#modal_PRMSICCD").val()),
        PRMSICDS: parseInput($("#modal_PRMSICDS").val()),
        NAICSCD: parseInput($("#modal_NAICSCD").val()),
        NAICSDS: parseInput($("#modal_NAICSDS").val()),
        SQFOOTCD: parseInput($("#modal_SQFOOTCD_button").text()),
        SQFOOTDS: parseInput($("#modal_SQFOOTDS").val()),
        LEMPSZCD: parseInput($("#modal_LEMPSZCD_button").text()),
        LEMPSZSZ: parseInput($("#modal_LEMPSZDS").val()),
        ALEMPSZ: parseInput($("#modal_ALEMPSZ").val()),
        LSALVOLCD: parseInput($("#modal_LSALVOLCD_button").text()),
        LSALVOLDS: parseInput($("#modal_LSALVOLDS").val()),
        ALSLSVOL: parseInput($("#modal_ALSLSVOL").val()),
        CSALVOLCD: parseInput($("#modal_CSALVOLCD_button").text()),
        CSALVOLDS: parseInput($("#modal_CSALVOLDS").val()),
        ACSLSVOL: parseInput($("#modal_ACSLSVOL").val()),
        LATITUDEO: null,
        LONGITUDEO: null,
        geom: null,
        desc: parseInput($("#modal_comment").val())
    }
    return obj;
}
function parseInput(val){
    if(isEmpty(val)) return null;
    if(isNaN(val)){
        if (val === 'Corporate Sales Volume') return null;
        if (val === 'Sales Volume') return null;
        if (val == 'SQF CODE') return null;
        if (val == 'EMP SIZE') return null;
        return val.trim().toUpperCase();
    }
    return `'${val}'`;
}
function isEmpty(txt){
    if(!txt) return true;   //undefined
    if(txt === '') return true; //empty
    return false;
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