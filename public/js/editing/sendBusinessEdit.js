/*
* Function that parses the form in editmodal into an object and sends a POST request to the server 
* with body containing the object of the form.
*
* Takes the values of all the input boxes and dropdowns and parses it.
* It checks for empty, default and non-numeric values. 
* Transforms sales volumes (in millions) to thousands to keep consistency
* of the database as it was originally stored as thousands but it is displayed
* as millions in our website. 
*
* Dependencies: loadEditModal.js(convertToThousandFromMillion), d3.js, jquery.js.
*
* Expected input: A valid business ID from the editModal div 'business_id'.
*
* Output: An alert box saying it if the changes was succesfully sent for approval.
*/
function sendBusinessEdit() {
    let business_id = $("#business_id").text();
    let form = getForm();
    d3.json(`/edit/${business_id}`, {
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
    let obj = {};
    obj = {
        PRMSICCD: parseFormInput($("#modal_PRMSICCD").val()),
        PRMSICDS: parseFormInput($("#modal_PRMSICDS").val()),
        NAICSCD: parseFormInput($("#modal_NAICSCD").val()),
        NAICSDS: parseFormInput($("#modal_NAICSDS").val()),
        SQFOOTCD: parseFormInput($("#modal_SQFOOTCD_button").text()),
        SQFOOTDS: parseFormInput($("#modal_SQFOOTDS").val()),
        LEMPSZCD: parseFormInput($("#modal_LEMPSZCD_button").text()),
        LEMPSZDS: parseFormInput($("#modal_LEMPSZDS").val()),
        ALEMPSZ: parseFormInput($("#modal_ALEMPSZ").val()),
        LSALVOLCD: parseFormInput($("#modal_LSALVOLCD_button").text()),
        LSALVOLDS: parseFormInput($("#modal_LSALVOLDS").val()),
        ALSLSVOL: parseFormInput_salesVol($("#modal_ALSLSVOL").val()),
        CSALVOLCD: parseFormInput($("#modal_CSALVOLCD_button").text()),
        CSALVOLDS: parseFormInput($("#modal_CSALVOLDS").val()),
        ACSLSVOL: parseFormInput_salesVol($("#modal_ACSLSVOL").val()),
        PRMCITY: parseFormInput($("#modal_PRMCITY").val()),
        PRMSTATE: parseFormInput($("#modal_PRMSTATE").val()),
        PRMZIP: parseFormInput($("#modal_PRMZIP").val()),
        LATITUDEO: $("#modal_LATITUDE").val(),
        LONGITUDEO: $("#modal_LONGITUDE").val(),
        geom: null,
        desc: $("#modal_comment").val(),
        by: null
    }
    return obj;
}
function parseFormInput(val){
    if(isFormInputEmpty(val)) return null;
    if(isNaN(val)){
        if (val === 'Corporate Sales Volume') return null;
        if (val === 'Sales Volume') return null;
        if (val == 'SQF Code') return null;
        if (val == 'Emp Size') return null;
        return val.trim().toUpperCase()
    }
    return val;
}
function parseFormInput_salesVol(val){
    if(isFormInputEmpty(val)) return null;
    if(isNaN(val)) return null;
    val = convertToThousandFromMillion(parseFloat(val));
    return val;
}
function isFormInputEmpty(txt){
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