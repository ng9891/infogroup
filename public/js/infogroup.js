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

  // Open multi-query sidebar
  $('.query-open-multiQuery').on('click', function() {
    window.loadMultiSearchSideBar();
  });
  // Search button on nav bar
  d3.select('#query-button').on('click', (e) => {
    query_input = d3.select('#query-search').property('value');
    query_type = d3.select('#query-dropdown').property('value');
    query_version = d3.select('#version-dropdown').property('value');
    query_input = query_input.trim();
    let inputObj = {};
    let conf;
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
        conf = confirm('This query might take more than a minute. Do you wish to continue?');
        if (conf === false) return;
        break;
      case 'region':
        conf = confirm('This query might take more than a minute. Do you wish to continue?');
        if (conf === false) return;
        if (isNaN(+query_input)) return alert('Invalid Input');
        break;
      case 'infoid':
        if (isNaN(+query_input)) return alert('Invalid Input');
        break;
      default:
        return alert('Invalid Query Selection');
    }
    loadEstablishments(query_type, query_input, query_version);
  });

  // Button listener to show legend
  d3.select('.legendButton').on('click', () => {
    toggle = d3.select('.legendContainer').classed('open');
    d3.select('.legendContainer').classed('open', toggle ? false : true);
  });

  /**
   * Helper function to restore map to the original state.
   * @param {Leaflet Map Object} map 
   * @param {Object} layerGroup Group of layers to remove filter with. eg. _naicsLayers or _matchcdLayers.
   */
  function removeFilterOnMap(map, layerGroup) {
    for (code in layerGroup) {
      map.removeLayer(layerGroup[code].layer);
    }
  }
  // Button listener to change pie chart type
  $('.togglePieBtn').click(() => {
    let dtable = $('#jq_datatable').DataTable();
    dtable.search('').columns().search('').draw();
    if ($('.togglePieBtn').text() === 'MatchCD') {
      let selectedSegments = _pie_naics.getOpenSegments();
      // Add back the removed layers when pie segments are selected for filtering.
      if (selectedSegments && selectedSegments.length > 0) {
        removeFilterOnMap(mymap, _naicsLayers, _pie_naics);
        _pie_naics.redraw();
      }
      $('.infoContainer #pieChart').css('display', 'none');
      $('.infoContainer #pieChartMatchCD').css('display', 'block');
      $('.togglePieBtn').text('NAICS');
      $('.infoContainer #pieChartMatchCD').promise().done(function() {
        _pie_matchcd.redraw();
        mymap.addLayer(matchCDClustermarkers);
        mymap.removeLayer(naicsClustermarkers); // Deselect naics in layer control
        mymap.removeLayer(clusterSubgroup);
      });
    } else {
      let selectedSegments = _pie_matchcd.getOpenSegments();
      // Add back the removed layers when pie segments are selected for filtering.
      if (selectedSegments && selectedSegments.length > 0) {
        removeFilterOnMap(mymap, _matchcdLayers);
        _pie_matchcd.redraw();
      }
      $('.infoContainer #pieChartMatchCD').css('display', 'none');
      $('.infoContainer #pieChart').css('display', 'block');
      $('.togglePieBtn').text('MatchCD');
      $('.infoContainer #pieChart').promise().done(function() {
        _pie_naics.redraw();
        mymap.addLayer(naicsClustermarkers);
        mymap.removeLayer(matchCDClustermarkers); // Deselect matchCD in layer control
        mymap.removeLayer(clusterSubgroup);
      });
    }
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

  $('#adv_MATCHCD li').unbind('click').click(function() {
    let str = $(this).text();
    $(this).parents('.dropdown').find('.btn').html(str + ' <span class="caret"></span>');
    $('#adv_MATCHCD').val($(this).attr('value'));
  });

  $('#adv_NAICSDS').on('autocompleteresponse', function(event, ui) {
    if (ui.content.length === 0) {
      $(this).data().value = 9999999999;
    }
  });

  d3.select('#advsearch-button').on('click', (e) => {
    let coname = $('#adv_CONAME').val().trim();
    let naicsDS = $('#adv_NAICSDS').val().trim();
    let naicsCD = $('#adv_NAICSDS').data().value;
    if (naicsCD && !naicsDS) naicsCD = undefined;
    let prmSicDs = $('#adv_PRMSICDS').val().trim();
    let roadDist = parseFloat($('#adv_roadDist').val().trim());
    if (isNaN(roadDist)) roadDist = '';
    let roadSigning = $('#adv_roadSigning').val().trim();
    let roadNo = $('#adv_roadNo').val().trim();
    if (roadNo) {
      if (!roadSigning) return $('#search-message').text('*Please input a road signing.').show();
      if (!roadDist) roadDist = window.defaultRoadBufferSize;
      else if (isNaN(roadDist)) return alert('Invalid Distance.');
      else if (roadDist > 10) return $('#search-message').text('*Please input a distance less than 10 miles.').show();
      else if (roadDist <= 0) return $('#search-message').text('*Please input a distance greater than 0.').show();
    }
    let minempl = $('#min-emplsize').val().trim();
    let maxempl = $('#max-emplsize').val().trim();
    let county = $('#countyName').val().trim();
    let indexOfDash = county.lastIndexOf('-');
    let stateCode;
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

    let matchCD = $('#adv_MATCHCD').val();

    let query_version = d3.select('#version-dropdown').property('value');

    let formBody = {
      coname: coname,
      naicsDS: naicsDS,
      naicsCD: naicsCD,
      prmSicDs: prmSicDs,
      roadNo: roadNo,
      roadSigning: roadSigning,
      roadDist: roadDist,
      minEmp: minempl,
      maxEmp: maxempl,
      lsalvol: lsalvol,
      county: county,
      stateCode: stateCode,
      mpo: mpo_name,
      mun: mun_name,
      mun_type: mun_type,
      mun_county: mun_county,
    };

    if (matchCD) formBody.matchCD = matchCD;
    // console.log(formBody);
    // TODO: Check if no changes before loading.
    loadEstablishments('adv', formBody, query_version);
    $('#search-message').hide();
    $('.advancedSearchContainer').toggleClass('open');
  });

  d3.select('#advsearch-btn-currLayer').on('click', (e) => {
    let coname = $('#adv_CONAME').val().trim();
    let naicsDS = $('#adv_NAICSDS').val().trim();
    let naicsCD = $('#adv_NAICSDS').data().value;
    if (naicsCD && !naicsDS) naicsCD = undefined;
    let prmSicDs = $('#adv_PRMSICDS').val().trim();
    let minempl = $('#min-emplsize').val().trim();
    let maxempl = $('#max-emplsize').val().trim();
    let lsalvol = $('#dropdownSalesVolume').text().trim();
    if (lsalvol == 'Sales Volume') lsalvol = '';
    let matchCD = $('#adv_MATCHCD').val();
    let query_version = d3.select('#version-dropdown').property('value');
    let prevTitle = $('.search-description h4').first().text().trim();
    if (prevTitle.startsWith('NOT FOUND')) prevTitle = prevTitle.slice(9);
    let prevSubtitle = $('.search-description h6').first().text().trim();
    let cLayer = queryLayer[queryLayer.length - 1];
    if (!cLayer) return alert('Error. There was no overlay found.');

    let formBody = {
      prevTitle: prevTitle,
      prevSubtitle: prevSubtitle,
      coname: coname,
      naicsDS: naicsDS,
      naicsCD: naicsCD,
      prmSicDs: prmSicDs,
      minEmp: minempl,
      maxEmp: maxempl,
      lsalvol: lsalvol,
      geom: cLayer.toGeoJSON(),
      dist: window.defaultRoadBufferSize,
      v: query_version,
    };
    for (form in formBody) if (!formBody[form]) delete formBody[form]; // Delete empty keys.

    // console.log('formBody geom', formBody.geom);
    if (cLayer instanceof L.Marker) return;
    if (
      formBody.geom.features &&
      formBody.geom.features.length > 0 &&
      formBody.geom.features[0].geometry.type === 'MultiPolygon'
    )
      delete formBody['dist'];
    else if (cLayer instanceof L.Rectangle || cLayer instanceof L.Polygon) delete formBody['dist'];

    if (matchCD) formBody.matchCD = matchCD;

    // Circle is handled differently here compared to multiquery.
    // Add a property radius.
    if (cLayer instanceof L.Circle) {
      delete formBody['dist'];
      const radius = cLayer.getRadius() * 0.00062137;
      formBody.geom.properties.radius = radius;
    }
    // console.log(formBody);
    // TODO: Check if no changes before loading.
    loadEstablishments('currLayer', formBody, query_version);
    $('#search-message').hide();
    $('.advancedSearchContainer').toggleClass('open');
  });

  d3.select('#advsearch-resetBtn').on('click', (e) => {
    $('#adv_CONAME').val('');
    $('#adv_NAICSDS').val('');
    $('#adv_NAICSDS').data().value = undefined;
    $('#adv_PRMSICDS').val('');
    $('#adv_roadNo').val('');
    $('#adv_roadSigning').val('');
    // $('#adv_roadGid').val('');
    $('#adv_roadDist').val('');
    $('#min-emplsize').val('');
    $('#max-emplsize').val('');
    $('#countyName').val('');
    $('#mpoId').val('');
    $('#munId').val('');
    $('#dropdownSalesVolume').text('Sales Volume ');
    $('#adv_MATCHCD').val('');
    $('#adv_MATCHCD_button').text('MATCH LEVEL CODE ');
  });
}
