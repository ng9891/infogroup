/*
* Infogroup.js contains general logistic and listeners of the site.
*
* It will load the necessary dropdowns and autocomplete when document is ready by
* calling loadAutoComplete and loadDropdown
* 
* Creates event listeners of the main webpage. 
*   - Navigation bar search button.
*   - Hidding and showing side panels
*   - Advanced search container listeners when opened
*
* Call appropiate query handler depending on nav dropdown query type selection
*
* Dependencies: loadAutoComplete.js, loadDropdown.js, jquery.js
*
* Expected input: None.
*
* Output: Initial page working properly with dropdowns and autocomplete features.
*/
$(document).ready(function() {
  let query_input, query_type, query_version;
  $('#query-search').keydown((event) => {
    //Enter Key
    if (event.keyCode == 13) {
      event.preventDefault();
      $('#query-button').click();
    }
  });
  // Select all on focus of nav bar search
  $('#query-search').on('click', function() {
    $(this).select();
  });

  // Search button on nav bar
  d3.select('#query-button').on('click', (e) => {
    // clearUsrMarker(); // function in map.js to clear user drawings
    // clearUi();
    query_input = d3.select('#query-search').property('value');
    query_type = d3.select('#query-dropdown').property('value');
    query_version = d3.select('#version-dropdown').property('value');
    query_input = query_input.trim();
    switch (query_type) {
      case 'zip':
        if (query_input.length < 4 || isNaN(+query_input)) {
          alert('Invalid Input');
        } else {
          loadEstablishments(query_type, query_input, query_version);
        }
        break;
      case 'county':
        if (query_input.length <= 3) {
          alert('Invalid Input');
        } else {
          loadEstablishments(query_type, query_input, query_version);
        }
        break;
      case 'mpo':
        if (query_input.length <= 3) {
          alert('Invalid Input');
        } else {
          loadEstablishments(query_type, query_input, query_version);
        }
        break;
      case 'mun':
        if (query_input.length <= 3) {
          alert('Invalid Input');
        } else {
          let indexOfDash = query_input.indexOf('-');
          // let mun, county;
          let inputObj = {};
          if (indexOfDash !== -1) {
            let type = query_input.slice(indexOfDash + 2);
            inputObj['type'] = type.slice(0, type.indexOf('/'));
            inputObj['county'] = type.slice(type.indexOf('/') + 1);
            inputObj['mun'] = query_input.slice(0, indexOfDash - 1);
          }
          loadEstablishments(query_type, inputObj, query_version);
        }
        break;
      case 'naics':
        if (query_input.length < 2) {
          alert('Invalid Input');
        } else {
        }
        break;
    }
  });

  //Button listener to show statisticsContainer
  $('.statisticsContainerButton').click(() => {
    $('.statisticsContainer').toggleClass('open');
  });

  //Button listener to show advancedSearchContainer
  $('.advancedSearchContainerButton').click(() => {
    $('.advancedSearchContainer').toggleClass('open');
    $('#search-message').hide();
    loadAdvancedSearchListener();
  });

  //Button listener to hide infoContainer
  $('.infoContainerButton').click(() => {
    $('.infoContainer').toggleClass('closed');
  });

  // Autocomplete
  loadAutoComplete();
  // Dropdowns for Advanced search and editModal
  loadDropdown();
  // General Legend
  loadLegend();
});

function loadAdvancedSearchListener() {
  $('#salesvolume-dropdown a').click(function(e) {
    $(this).parents('.dropdown').find('.btn').html($(this).text() + ' <span class="caret"></span>');
    $(this).parents('.dropdown').find('.btn').val($(this).data('value'));
  });

  $('#adv_NAICSCD').unbind('change').change(autoFillText_avdSearch);
  // $('#adv_NAICSDS').unbind("change").change(autoFillText_avdSearch);

  d3.select('#advsearch-button').on('click', (e) => {
    let industry = $('#adv_NAICSDS').val().trim();
    let naicscode = $('#adv_NAICSCD').val().trim();
    let roadNo = $('#adv_roadNo').val().trim();
    let roadSigning = $('#adv_roadSigning').val().trim();
    // let roadGid = $('#adv_roadGid').val().trim();
    let roadDist = $('#adv_roadDist').val().trim();
    let minempl = $('#min-emplsize').val().trim();
    let maxempl = $('#max-emplsize').val().trim();
    let county_name = $('#countyName').val().trim();
    let mpo_name = $('#mpoId').val().trim();
    let mun_name = $('#munId').val().trim();

    let mun_type, mun_county;
    let indexOfDash = mun_name.indexOf('-');
    if (indexOfDash !== -1) {
      let type = mun_name.slice(indexOfDash + 2);
      mun_type = type.slice(0, type.indexOf('/'));
      mun_county = type.slice(type.indexOf('/') + 1);
      mun_name = mun_name.slice(0, indexOfDash - 1);
    }

    let lsalvol = $('#dropdownSalesVolume').text().trim();
    if (lsalvol == 'Sales Volume') lsalvol = '';

    let query_version = d3.select('#version-dropdown').property('value');

    let formBody = {
      naicsds: industry,
      naicscd: naicscode,
      roadNo: roadNo,
      roadSigning: roadSigning,
      // roadGid: roadGid,
      roadDist: roadDist,
      minEmp: minempl,
      maxEmp: maxempl,
      lsalvol: lsalvol,
      county: county_name,
      mpo: mpo_name,
      mun: mun_name,
      mun_type: mun_type,
      mun_county: mun_county,
      version: query_version,
    };

    loadEstablishments('adv', formBody, query_version);

    $('.advancedSearchContainer').toggleClass('open');
  });

  d3.select('#advsearch-resetBtn').on('click', (e) => {
    $('#adv_NAICSDS').val('');
    $('#adv_NAICSCD').val('');
    $('#adv_roadNo').val('');
    $('#adv_roadSigning').val('');
    // $('#adv_roadGid').val('');
    $('#adv_roadDist').val('');
    $('#min-emplsize').val('');
    $('#max-emplsize').val('');
    $('#countyName').val('');
    $('#mpoId').val('');
    $('#munId').val('');
    $('#dropdownSalesVolume').text('Sales Volume');
  });
}

/**This function is calling from public/js/loadDatatable.js (in DataTable)
 * Purpose: To update business_audit table, making entity primary or not
 */
function updatePrimaryField(entityId) {
  // TODO: Some Ajax request to update business_audit (boolean field)
  if (document.getElementById('prmswitch' + entityId).checked) {
    alert('update business_audit for id = ' + entityId + ' (make this field primary)');
  } else {
    alert('update business_audit for id = ' + entityId + ' (make this field not primary)');
  }
}
function autoFillText_avdSearch(e) {
  let element = e.target.id;
  let queryType = element.slice(4, -2); // Takes out 'modal_' and last 2 chars
  let type = element.substr(-2); // Gets CD or DS
  let arr = [];
  let change_element; // Element to autofill
  let input;
  switch (queryType) {
    case 'NAICS':
      input = $('#' + element).val();
      if (type === 'CD') {
        arr = _obj_naics_arr[0];
        change_element = '#adv_NAICSDS';
      }
      if (type === 'DS') {
        arr = _obj_naics_arr[1];
        change_element = '#adv_NAICSCD';
      }
      if (arr[input]) $(change_element).val(arr[input]);
      break;
  }
}
