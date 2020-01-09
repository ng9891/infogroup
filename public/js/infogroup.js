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
    query_input = d3.select('#query-search').property('value');
    query_type = d3.select('#query-dropdown').property('value');
    query_version = d3.select('#version-dropdown').property('value');
    query_input = query_input.trim();
    let inputObj = {};
    switch (query_type) {
      case 'zip':
        if (query_input.length < 2 || isNaN(+query_input)) return alert('Invalid Input');
        break;
      case 'county':
        if (query_input.length < 4) return alert('Invalid Input');
        let indexOfDash = query_input.lastIndexOf('-');
        inputObj = {};
        if (indexOfDash !== -1) {
          inputObj['county'] = query_input.slice(0, indexOfDash - 1);
          inputObj['stateCode'] = query_input.slice(indexOfDash + 2);
        }
        query_input = inputObj;
        break;
      case 'mun':
        if (query_input.length >= 4 && isNaN(+query_input)) {
          let indexOfDash = query_input.indexOf('-');
          inputObj = {};
          if (indexOfDash !== -1) {
            let type = query_input.slice(indexOfDash + 2);
            inputObj['type'] = type.slice(0, type.indexOf('/'));
            inputObj['county'] = type.slice(type.indexOf('/') + 1);
            inputObj['mun'] = query_input.slice(0, indexOfDash - 1);
          } else {
            inputObj['mun'] = query_input;
          }
          query_input = inputObj;
        }
        break;
      case 'railroad':
        let indexOfOpenParentheses = query_input.trim().lastIndexOf('(');
        inputObj = {
          station: query_input.trim(),
        };
        if (indexOfOpenParentheses !== -1) {
          // Separate values from parentheses
          inputObj['input'] = query_input.trim();
          inputObj['station'] = query_input.slice(0, indexOfOpenParentheses - 1);
          let route = query_input.slice(indexOfOpenParentheses + 1, -1);
          if (route !== 'LI' && route !== 'MN') inputObj['route'] = route.split(',').join(' ');
        }
        query_input = inputObj;
        break;
      case 'mpo':
      case 'geocoding':
        if (query_input.length < 4 || !isNaN(+query_input)) return alert('Invalid Input');
        let conf = confirm('This query might take more than a minute. Do you want to continue?');
        if (conf === false) return;
        break;
      default:
        return alert('Invalid Query Selection');
    }
    loadEstablishments(query_type, query_input, query_version);
  });

  // Button listener to show statisticsContainer
  $('.statisticsContainerButton').click(() => {
    $('.statisticsContainer').toggleClass('open');
  });

  // Button listener to show advancedSearchContainer
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

  d3.select('#advsearch-button').on('click', (e) => {
    let coname = $('#adv_CONAME').val().trim();
    let industry = $('#adv_NAICSDS').val().trim();
    let naicscode = $('#adv_NAICSCD').val().trim();
    let roadNo = $('#adv_roadNo').val().trim();
    let roadSigning = $('#adv_roadSigning').val().trim();
    // let roadGid = $('#adv_roadGid').val().trim();
    let roadDist = $('#adv_roadDist').val().trim();
    roadDist = parseFloat(roadDist);
    if (!roadDist) roadDist = window.defaultRoadBufferSize;
    else if (isNaN(roadDist)) return alert('Invalid Distance.');
    else if (roadDist > 10) return $('#search-message').text('*Please input a distance less than 10 miles.').show();
    else if (roadDist <= 0) return $('#search-message').text('*Please input a distance greater than 0.').show();
    let minempl = $('#min-emplsize').val().trim();
    let maxempl = $('#max-emplsize').val().trim();
    let county = $('#countyName').val().trim();
    let indexOfDash = county.lastIndexOf('-');
    let state, stateCode;
    if (indexOfDash !== -1) {
      stateCode = county.slice(indexOfDash + 2);
      county = county.slice(0, indexOfDash - 1);
    }

    let mpo_name = $('#mpoId').val().trim();
    let mun_name = $('#munId').val().trim();

    let mun_type, mun_county;
    indexOfDash = mun_name.indexOf('-');
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
      coname: coname,
      naicsds: industry,
      naicscd: naicscode,
      roadNo: roadNo,
      roadSigning: roadSigning,
      // roadGid: roadGid,
      roadDist: roadDist,
      minEmp: minempl,
      maxEmp: maxempl,
      lsalvol: lsalvol,
      county: county,
      state: state,
      stateCode: stateCode,
      mpo: mpo_name,
      mun: mun_name,
      mun_type: mun_type,
      mun_county: mun_county,
    };

    loadEstablishments('adv', formBody, query_version);
    $('#search-message').hide();
    $('.advancedSearchContainer').toggleClass('open');
  });

  d3.select('#advsearch-resetBtn').on('click', (e) => {
    $('#adv_CONAME').val('');
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
    alert('Sorry. Feature is in development. Make field primary.');
    // alert('update business_audit for id = ' + entityId + ' (make this field primary)');
  } else {
    alert('Sorry. Feature is in development. Make field non-primary.');
    // alert('update business_audit for id = ' + entityId + ' (make this field not primary)');
  }
}
