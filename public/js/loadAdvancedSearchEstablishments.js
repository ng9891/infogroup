/* 
This function called in public/infogroup.js file. 
Purpose: Gets values from Advanced Search Form, 
		checks the values, builds necessary get link 
		and pass parameters to the controllers/advancedSearch.js
		Latter returns data in accordance with the SQL query.
*/
function loadAdvancedSearchEstablishments(formBody, query_version = 'current') {
  $('div.Object-desc').empty();
  $('#pieChart').empty();
  if (usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user

  let searchType = 'Search:';
  let searchValue = '';

  let reqURL = '/api/search?';
  formBody.query_version = query_version;
  let query = $.param(formBody);
  reqURL += query;

  // Search criteria for display
  let firstRow = {
    MPO: formBody.mpo,
    County: formBody.county,
    Mun: formBody.mun,
    'Mun County': formBody.mun_county,
  };
  let secondRow = {
    Industry: formBody.industry,
    Code: formBody.naicscd,
    EmpMin: formBody.minEmp,
    EmpMax: formBody.maxEmp,
    Sales: formBody.lsalvol,
  };
  let arr_obj = [firstRow, secondRow];
  searchValue = buildSearchValString(arr_obj);

  // console.log(reqURL);

  d3.json(reqURL).then((data) => {
    if (data.data.length == 0) {
      $('.advancedSearchContainer').toggleClass('open');
      $('#search-message').show().delay(5000).fadeOut();
      clearDatatable(); //loadDatatable.js

      searchValue[0] = 'NOT FOUND.' + searchValue[0];
      updateSearchInfo('Search:', searchValue);
    } else {
      //TODO: check for max data length and alert user
      console.log(data.data);
      mapEstablishments(data);
      loadPieChart(data);
      loadHistogram(data);
      loadDatatable(data);
      updateSearchInfo(searchType, searchValue);

      if (formBody.mun != '') {
        //Get Query layer/ bounding box
        d3.json('/api/getmun/' + formBody.mun).then((data) => {
          loadQueryOverlay(data);
        }, function(err) {
          alert('Query Error on Base Layer');
          console.log(err);
        });
      } else if (formBody.county != '') {
        //Get Query layer/ bounding box
        d3.json('/api/getcounty/' + formBody.county).then((data) => {
          loadQueryOverlay(data);
        }, function(err) {
          alert('Query Error on Base Layer');
          console.log(err);
        });
      } else if (formBody.mpo != '') {
        //Get Query layer/ bounding box
        d3.json('/api/getmpo/' + formBody.mpo).then((data) => {
          loadQueryOverlay(data);
        }, function(err) {
          alert('Query Error on Base Layer');
          console.log(err);
        });
      }
    }
  }, function(err) {
    alert('Query Error');
    console.log(err);
  });
}

// Helper function to print the search value in '.search-description'
function buildSearchValString(arr_obj) {
  let arr_str = [];
  arr_obj.map((obj) => {
    let key_arr = Object.keys(obj);
    let string = '';
    let filtered_key_arr = key_arr.filter((k) => {
      return obj[k] != '';
    });

    filtered_key_arr.map((k, i) => {
      if(obj[k]){
        string += ` ${k}: ${obj[k]}`;
        if (i < filtered_key_arr.length - 1) string += ',';
      }
    });
    arr_str.push(string);
  });

  return arr_str;
}
