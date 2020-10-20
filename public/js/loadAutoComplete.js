/*
* loadAutoComplete will load the autocomplete features of the website.
*
* It makes a d3.json request to the URL and loads it to the desired input text boxes.
*
* It also loads 2 global variables, _obj_naics_arr and _obj_sic_arr, to be used for form
* input checking and autofill. (NAICS code and Primary SIC code)
*
* Targets the input boxes in the navigation bar, editmodal and advanced search
* for area (county,mpo,...), naics and primary sic queries.
*
* Dependencies: d3.js, jquery-ui
*/
let _obj_naics_arr = [];
let _obj_sic_arr = [];
function loadAutoComplete() {
  // Declare the AC on ready. Main Page
  // $('#query-search').autocomplete();
  $('#query-search').on('focus', function() {
    query_type = d3.select('#query-dropdown').property('value');
    switch (query_type) {
      case 'zip':
        autoComplete_url('#query-search', 'zip');
        break;
      case 'county':
        autoComplete_url('#query-search', 'county', 1);
        break;
      case 'mpo':
        autoComplete_url('#query-search', 'mpo', 0);
        $(this).autocomplete('search', $(this).val());
        break;
      case 'mun':
        autoComplete_url('#query-search', 'mun');
        break;
      case 'railroad':
        autoComplete_url('#query-search', 'railroad');
        break;
      case 'region':
        autoComplete_url('#query-search', 'region', 1);
        break;
      case 'infoid':
        autoComplete_url('#query-search', 'infoid', 5);
        break;
      default:
        // Geocode
        if ($('#query-search').hasClass('ui-autocomplete-input')) {
          $('#query-search').autocomplete('destroy');
        }
    }
  });

  // Advance search autocomplete
  autoComplete_url('#adv_CONAME', 'coname');
  autoComplete_url('#countyName', 'county', 1);
  autoComplete_url('#mpoId', 'mpo', 0);
  $('#mpoId').focus(function() {
    $(this).autocomplete('search', $(this).val());
  });
  autoComplete_url('#munId', 'mun');

  d3.json(`/api/getindustries`).then((data) => {
    let obj_naics_cd = {};
    let obj_naics_ds = {};
    let arr_data_cd = [];
    let arr_data_ds = new Set();
    data.data.map((est) => {
      obj_naics_cd[est.NAICSCD.toString()] = est.NAICSDS;
      obj_naics_ds[est.NAICSDS] = est.NAICSCD.toString();
      arr_data_cd.push(est.NAICSCD.toString());
      arr_data_ds.add(est.NAICSDS);
    });
    _obj_naics_arr.push(obj_naics_cd);
    _obj_naics_arr.push(obj_naics_ds);
    autoComplete_text(arr_data_cd, '#modal_NAICSCD');
    autoComplete_text([...arr_data_ds], '#modal_NAICSDS');
    // autoComplete_text(arr_data_cd, '#adv_NAICSCD');
  }, function(err) {
    console.log(err);
  });

  // Advanced Search autocomplete for 2 and 4 digits NAICS code.
  let twoAndFourDigitNaics = [];
  let twoDigitSet = new Set(); // twoDigitNaics has some repeated titles. EG. 31-33 Manufacturing.
  for (let key in twoDigitNaics) {
    if (naicsKeys[key].title) {
      if (twoDigitSet.has(naicsKeys[key].title)) continue;
      twoAndFourDigitNaics.push({
        label: naicsKeys[key].title.toUpperCase(),
        value: key,
      });
      twoDigitSet.add(naicsKeys[key].title);
    } else {
      if (twoDigitSet.has(naicsKeys[naicsKeys[key].part_of_range].title)) continue;
      twoDigitSet.add(naicsKeys[naicsKeys[key].part_of_range].title);
      twoAndFourDigitNaics.push({
        label: naicsKeys[naicsKeys[key].part_of_range].title.toUpperCase(),
        value: naicsKeys[key].part_of_range,
      });
    }
  }
  twoAndFourDigitNaics.push({
    label: 'Unclassified Establishments'.toUpperCase(),
    value: 99,
  });

  for (let key in fourDigitNaics) {
    twoAndFourDigitNaics.push({
      label: fourDigitNaics[key].toUpperCase(),
      value: key,
    });
  }
  autoComplete_text(twoAndFourDigitNaics, '#adv_NAICSDS');

  d3.json(`/api/getsic`).then((data) => {
    let obj_sic_cd = {};
    let obj_sic_ds = {};
    let arr_data_cd = [];
    let arr_data_ds = [];
    data.data.map((est) => {
      obj_sic_cd[est.PRMSICCD.toString()] = est.PRMSICDS;
      obj_sic_ds[est.PRMSICDS] = est.PRMSICCD.toString();
      arr_data_cd.push(est.PRMSICCD.toString());
      arr_data_ds.push(est.PRMSICDS);
    });
    _obj_sic_arr.push(obj_sic_cd);
    _obj_sic_arr.push(obj_sic_ds);
    autoComplete_text(arr_data_cd, '#modal_PRMSICCD');
    autoComplete_text(arr_data_ds, '#modal_PRMSICDS');
    autoComplete_text(arr_data_ds, '#adv_PRMSICDS'); //adv search
  }, function(err) {
    console.log(err);
  });
}
/*
This function will take the parement 'type' and adds it to the URL for a GET request to get a list for the autocomplete feature.
Expected input: a string that creates a valid API URL with the param 'column'. eg. 'zip' -> getzip route, 'county'->getcounty route
                 inputId: string with id of the HTML element to Autocomplete. eg. '#query-search'
                 minlen: int with minimum length to query database
                 type: string variable to complete the URL. eg. /api/getsic/test?type='cd'
Output: An expected list of autocompletion displayed below 'inputId' input box
*/
function autoComplete_url(inputId, column, minlen = 2, selectCb = () => {}) {
  let prevGeomToShow;
  $(inputId).autocomplete({
    delay: 1000,
    minLength: minlen,
    sortResults: false,
    source: function(request, response) {
      let input = request.term.trim();
      let url = `/api/get${column}/`;
      if (column === 'railroad')
        url += `?station=${encodeURIComponent(input)}`; // railroad get URL is a bit different because string contains '/'
      else if (column === 'infoid') url = `/api/by${column}/${input}`
      else url += `${encodeURIComponent(input)}`;
      $.ajax({
        type: 'GET',
        dataType: 'json',
        url: url,
        success: function(data) {
          if (data) {
            let arr_data = [];
            data.data.map((d) => {
              if (d.muni_type) {
                // Municipal query formatting
                d.name += ' - ' + capitalizeFirstLetter(d.muni_type) + '/' + capitalizeFirstLetter(d.county);
              } else if (d.state) {
                // County formatting
                d.name += ' - ' + capitalizeFirstLetter(d.state_code);
              }
              if (column === 'infoid'){
                d.name = d.INFOUSAID;
                d.geom = d.geopoint;
              }
              arr_data.push(d);
            });
            $(inputId).removeClass('.ui-autocomplete-loading ');
            response(
              $.map(arr_data.slice(0, 30), function(obj) {
                return {
                  label: obj.name,
                  value: obj.name,
                  geom: obj.geom,
                };
              })
            );
          }
        },
      });
    },
    select: selectCb,
    focus: function(e, ui) {
      if (e.keyCode === 38 || e.keyCode === 40) {
        // Focus on geom.
        if(!ui.item.geom) return;
        try{
          if(prevGeomToShow) window.mymap.removeLayer(prevGeomToShow);
          let geoJSON = JSON.parse(ui.item.geom);
          prevGeomToShow = L.geoJSON(geoJSON);
          window.mymap.addLayer(prevGeomToShow);
          window.mymap.fitBounds(prevGeomToShow.getBounds(), {padding: [100, 100]});
        }catch(e){
          return console.log(e);
        }
      }
    },
    close: function(e, ui){
      if(!prevGeomToShow) return;
      window.mymap.removeLayer(prevGeomToShow);
    }
  });
}

function autoComplete_text(data, inputId) {
  $(inputId).autocomplete({
    delay: 0,
    minLength: 2,
    sortResults: false,
    source: function(request, response) {
      let results = $.ui.autocomplete.filter(data, request.term);
      response(results.slice(0, 15));
    },
    messages: {
      noResults: '',
      results: function() {},
    },
    select: function(event, ui) {
      event.preventDefault();
      $(this).val(ui.item.label);
      $(this).data().value = ui.item.value;
    },
  });
}
// Overrides the default autocomplete filter function to search only from the beginning of the string
//  $.ui.autocomplete.filter = function (array, term) {
//     var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(term), "i");
//     return $.grep(array, function (value) {
//             return matcher.test(value.label || value.value || value);
//     });
// };

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
