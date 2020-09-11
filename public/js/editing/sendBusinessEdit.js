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
  let business_id = $('#business_id').text();
  let form = getForm();

  fetch(`/edit/business/${business_id}`, {
    method: 'POST',
    body: JSON.stringify(form),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((res) => {
      let json = res.json();
      if (!res.ok) {
        // throw Error
        return json.then(Promise.reject.bind(Promise));
      }
      return json;
    })
    .then(() => {
      alert('Sent for approval');
      $('#byemodal').click();
    })
    .catch((err) => {
      if(err.status === 'CHECK ERROR'){
        return alert(err.responseText);
      }
      alert('Error in submission');
      console.log(err);
    });
}

// function getForm() {
//   let obj = {
//     alias: parseFormInput($('#modal_alias').val()),
//     CONAME: parseFormInput($('#modal_CONAME').val()),
//     PRMSICCD: parseFormInput($('#modal_PRMSICCD').val()),
//     PRMSICDS: parseFormInput($('#modal_PRMSICDS').val()),
//     NAICSCD: parseFormInput($('#modal_NAICSCD').val()),
//     NAICSDS: parseFormInput($('#modal_NAICSDS').val()),
//     SQFOOTCD: parseFormInput($('#modal_SQFOOTCD_button').text()),
//     SQFOOTDS: parseFormInput($('#modal_SQFOOTDS').val()),
//     LEMPSZCD: parseFormInput($('#modal_LEMPSZCD_button').text()),
//     LEMPSZDS: parseFormInput($('#modal_LEMPSZDS').val()),
//     ALEMPSZ: parseFormInput($('#modal_ALEMPSZ').val()),
//     LSALVOLCD: parseFormInput($('#modal_LSALVOLCD_button').text()),
//     LSALVOLDS: parseFormInput($('#modal_LSALVOLDS').val()),
//     ALSLSVOL: parseFormInput_salesVol($('#modal_ALSLSVOL').val()),
//     CSALVOLCD: parseFormInput($('#modal_CSALVOLCD_button').text()),
//     CSALVOLDS: parseFormInput($('#modal_CSALVOLDS').val()),
//     ACSLSVOL: parseFormInput_salesVol($('#modal_ACSLSVOL').val()),
//     PRMCITY: parseFormInput($('#modal_PRMCITY').val()),
//     PRMSTATE: parseFormInput($('#modal_PRMSTATE').val()),
//     PRMZIP: parseFormInput($('#modal_PRMZIP').val()),
//     LATITUDEO: $('#modal_LATITUDE').val(),
//     LONGITUDEO: $('#modal_LONGITUDE').val(),
//     desc: $('#modal_comment').val(),
//     by: null,
//   };
//   return obj;
// }

function getForm() {
  // Check if CA
  let obj = {
    alias: parseFormInput($('#modal_alias').val()),
    COMPANY_NAME: parseFormInput($('#modal_CONAME').val()),
    PRIMARY_SIC_CODE: parseFormInput($('#modal_PRMSICCD').val()),
    PRIMARY_SIC_DESC: parseFormInput($('#modal_PRMSICDS').val()),
    NAICS_CODE: parseFormInput($('#modal_NAICSCD').val()),
    NAICS_DESC: parseFormInput($('#modal_NAICSDS').val()),
    SQUARE_FOOTAGE_CODE: parseFormInput($('#modal_SQFOOTCD_button').text()),
    SQUARE_FOOTAGE_DESC: parseFormInput($('#modal_SQFOOTDS').val()),
    LOCATION_EMPLOYMENT_SIZE_CODE: parseFormInput($('#modal_LEMPSZCD_button').text()),
    LOCATION_EMPLOYMENT_SIZE_DESC: parseFormInput($('#modal_LEMPSZDS').val()),
    ACTUAL_LOCATION_EMPLOYMENT_SIZE: parseFormInput($('#modal_ALEMPSZ').val()),
    LOCATION_SALES_VOLUME_CODE: parseFormInput($('#modal_LSALVOLCD_button').text()),
    LOCATION_SALES_VOLUME_DESC: parseFormInput($('#modal_LSALVOLDS').val()),
    ACTUAL_LOCATION_SALES_VOLUME: parseFormInput_salesVol($('#modal_ALSLSVOL').val()),
    CORPORATE_SALES_VOLUME_CODE: parseFormInput($('#modal_CSALVOLCD_button').text()),
    CORPORATE_SALES_VOLUME_DESC: parseFormInput($('#modal_CSALVOLDS').val()),
    ACTUAL_CORPORATE_SALES_VOLUME: parseFormInput_salesVol($('#modal_ACSLSVOL').val()),
    PRIMARY_ADDRESS: parseFormInput($('#modal_PRMADDR').val()),
    PRIMARY_CITY: parseFormInput($('#modal_PRMCITY').val()),
    PRIMARY_STATE: parseFormInput($('#modal_PRMSTATE').val()),
    PRIMARY_ZIP_CODE: parseFormInput($('#modal_PRMZIP').val()),
    MATCH_LEVEL_CODE: parseFormInput($('#modal_MATCHCD').val()),
    LATITUDE_1: $('#modal_LATITUDE').val(),
    LONGITUDE_1: $('#modal_LONGITUDE').val(),
    comment: $('#modal_comment').val(),
  };
  return obj;
}
function parseFormInput(val) {
  if (isFormInputEmpty(val)) return null;
  if (isNaN(val)) {
    switch (val) {
      case 'Corporate Sales Volume':
      case 'Sales Volume':
      case 'SQF Code':
      case 'Emp Size':
      case 'NULL':
        return null;
      default:
        return val.trim().toUpperCase();
    }
  }
  return val;
}
// Helper function that helps converting million into thousands for range checking
function convertToThousandFromMillion(input) {
  if (!input) return null;
  if (isNaN(input)) return null;
  return parseFloat(input) * 1000;
}
function parseFormInput_salesVol(val) {
  if (isFormInputEmpty(val)) return null;
  if (isNaN(val)) return null;
  val = convertToThousandFromMillion(parseFloat(val));
  return val;
}
function isFormInputEmpty(txt) {
  if (!txt) return true; //undefined
  if (txt === '') return true; //empty
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
