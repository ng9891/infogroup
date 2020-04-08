/*
* Loads the dropdown menu feature for the website.
*
* Makes a server request using d3 to load the desired dropdowns.
* Targets the dropdown menu in the navigation bar, editmodal and advanced search
* for sales volumes, employment sizes and square foot selections.
*
* Dependencies: d3.js, jquery.js
*
* Expected input: None.
*
* Output: Dropdown menus with expected lists.
*/
function loadDropdown() {
  d3.json(`/api/getsalesvolume`).then((data) => {
    loadDropdown_SalesVolume(data); //function in file
  }, function(err) {
    console.log(err);
  });

  d3.json(`/api/getempsize`).then((data) => {
    loadDropdown_EmpSize(data); //function in file
  }, function(err) {
    console.log(err);
  });

  d3.json(`/api/getsqfoot`).then((data) => {
    loadDropdown_SqFoot(data); //function in file
  }, function(err) {
    console.log(err);
  });

  loadDropdown_MatchCD();
}
function loadDropdown_SalesVolume(input) {
  // Edit Modal
  let modal_salesVol_dropdown = $('#modal_LSALVOLCD');
  let modal_corpSalesVol_dropdown = $('#modal_CSALVOLCD');
  let adv_salesVol_dropdown = $('#salesvolume-dropdown');

  let list = input.data
    .map((est) => {
      if (est.LSALVOLCD !== null)
        return `<li value=${est.LSALVOLCD}><a class='dropdown-item' href='#'>${est.LSALVOLCD} - ${est.LSALVOLDS}</a></li>`;
    })
    .join('');

  if (modal_corpSalesVol_dropdown[0]) {
    modal_corpSalesVol_dropdown[0].innerHTML = list;
  }
  if (modal_salesVol_dropdown[0]) {
    modal_salesVol_dropdown.empty();
    modal_salesVol_dropdown[0].innerHTML = list;
  }
  if (adv_salesVol_dropdown[0]) {
    adv_salesVol_dropdown[0].innerHTML = input.data
      .map((est) => `<a class='dropdown-item' href='#'>${est.LSALVOLDS == null ? 'Sales Volume' : est.LSALVOLDS}</a>`)
      .join('');
  }
}

function loadDropdown_EmpSize(input) {
  // Edit Modal
  let modal_empSZ_dropdown = $('#modal_LEMPSZCD');
  if (modal_empSZ_dropdown[0]) {
    modal_empSZ_dropdown.empty();
    modal_empSZ_dropdown[0].innerHTML = input.data
      .map((est) => {
        if (est.LSALVOLCD !== null)
          return `<li value=${est.LEMPSZCD}><a class='dropdown-item' href='#'>${est.LEMPSZCD} - ${est.LEMPSZDS}</a></li>`;
      })
      .join('');
  }
}

function loadDropdown_SqFoot(input) {
  // Edit Modal
  let modal_SQFoot_dropdown = $('#modal_SQFOOTCD');
  if (modal_SQFoot_dropdown[0]) {
    modal_SQFoot_dropdown.empty();
    modal_SQFoot_dropdown[0].innerHTML = input.data
      .map((est) => {
        if (est.LSALVOLCD !== null)
          return `<li value=${est.SQFOOTCD}><a class='dropdown-item' href='#'>${est.SQFOOTCD} - ${est.SQFOOTDS}</a></li>`;
      })
      .join('');
  }
}

function loadDropdown_MatchCD(){
  let matchCDObj = {
    '2':'ZIP2',
    '4':'ZIP4',
    X: 'ZIP',
    '0': 'EXACT',
    P: 'PARCEL',
    NULL: 'UNKNOWN',
  }

  let html = '';
  for(key in matchCDObj){
    html += `<li value=${key}><a class='dropdown-item' href='#'>${matchCDObj[key]}</a></li>`
  }

  let modal_matchCD_dropdown = $('#modal_MATCHCD');
  let adv_matchCD_dropdown = $('#adv_MATCHCD');
  if (modal_matchCD_dropdown[0]) {
    modal_matchCD_dropdown.empty();
    modal_matchCD_dropdown[0].innerHTML = html;
    
  }

  if(adv_matchCD_dropdown[0]){
    adv_matchCD_dropdown.empty();
    adv_matchCD_dropdown[0].innerHTML = html;
  }

}