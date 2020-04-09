/*
 * loadEditModal.js contains general logistic and listeners of the editModal form to edit data.
 *
 * Takes a business ID and makes a server request to get the information about the business and 
 * loads it into the appropiate input boxes/ dropdowns. 
 * Converts sales volumes into millions for easier data checking and entrying.
 * 
 * Creates event listeners for the modal: 
 *  - Automatic dropdown selection based on user input.
 *  - Validates user for correct input type (expecting an int but got a letter string).
 *  - Checks if input falls within the range of the dropdown selection.
 *  - Form submission (calls sendBusinessEdit in editing/sendBusinessEdit.js).
 *  - Location editing handling (check, locate)
 *
 * Dependencies: 
 *  - loadAutoComplete.js(two global var), 
 *  - jquery.js, 
 *  - d3.js, 
 *  - Leaflet Geocoder
 *  - Esri Leaflet
 *  - Esri Leaflet Geocoder
 *
 * Expected input:   - business_id {int}.
 *                   - version {string} as 'current' or 'original'
 * Output: A fully functional Modal Form with input validation and automatic selection.
 */
// TODO: REFACTOR THIS CODE.
(() => {
  let _obj_naics_arr = [];
  let _obj_sic_arr = [];
  function loadEditModalAutocomplete() {
    function autoComplete_text(data, inputId) {
      $(inputId).autocomplete({
        delay: 0,
        minLength: 2,
        sortResults: false,
        source: function(request, response) {
          setTimeout(() => {
            var results = $.ui.autocomplete.filter(data, request.term);
            response(results.slice(0, 15));
          }, 500);
        },
        messages: {
          noResults: '',
          results: function() {},
        },
      });
    }
    d3.json(`/api/getindustries`).then((data) => {
      let obj_naics_cd = {};
      let obj_naics_ds = {};
      let arr_data_cd = [];
      data.data.map((est) => {
        obj_naics_cd[est.NAICSCD.toString()] = est.NAICSDS;
        obj_naics_ds[est.NAICSDS] = est.NAICSCD.toString();
        arr_data_cd.push(est.NAICSCD.toString());
      });
      _obj_naics_arr.push(obj_naics_cd);
      _obj_naics_arr.push(obj_naics_ds);
      autoComplete_text(arr_data_cd, '#modal_NAICSCD');
    }, function(err) {
      console.log(err);
    });
    // No repetition of 'industries description' purposes
    d3.json(`/api/getindustries?type='ds'`).then((data) => {
      let arr_data_ds = [];
      data.data.map((est) => {
        arr_data_ds.push(est.NAICSDS);
      });
      autoComplete_text(arr_data_ds, '#modal_NAICSDS');
    }, function(err) {
      console.log(err);
    });

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
    }, function(err) {
      console.log(err);
    });
  };

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

    function loadDropdown_SalesVolume(input) {
      // Edit Modal
      let modal_salesVol_dropdown = $('#modal_LSALVOLCD');
      let modal_corpSalesVol_dropdown = $('#modal_CSALVOLCD');

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
    
      let modal_matchCD_dropdown = $('#modal_MATCHCD');
      if (modal_matchCD_dropdown[0]) {
        modal_matchCD_dropdown.empty();
    
        let html = '';
        for(key in matchCDObj){
          html += `<li value=${key}><a class='dropdown-item' href='#'>${matchCDObj[key]}</a></li>`
        }
        modal_matchCD_dropdown[0].innerHTML = html;
      }
    }
  }

  loadEditModal = (business_id, version = 'current') => {
    if (!business_id || business_id === '') return;

    loadEditModalAutocomplete();
    loadDropdown();

    let reqURL = '/api/byid/' + business_id + '?v=' + version;
    d3.json(reqURL).then((data) => {
      if (data.data.length === 0) {
        $('#modal_title').text('Error - Business Not Found');
        return;
      }

      let est = data.data[0];
      let title = '';
      if (version === 'original')
        title = `<h4>${est.CONAME} - ID: <span id ="business_id">${business_id}</span> - ${version}</h4>`;
      else title = `<h4>${est.CONAME} - ID: <span id ="business_id">${business_id}</span></h4>`;
      $('#modal_title').html(title);
      $('#modal_CONAME').val(est.CONAME);
      $('#modal_alias').val(!est.alias ? '' : est.alias);
      $('#modal_ALEMPSZ').val(est.ALEMPSZ);
      $('#modal_NAICSCD').val(est.NAICSCD);
      $('#modal_NAICSDS').val(est.NAICSDS);
      $('#modal_PRMSICCD').val(est.PRMSICCD);
      $('#modal_PRMSICDS').val(est.PRMSICDS);
      $('#modal_PRMADDR').val(est.PRMADDR);
      $('#modal_PRMCITY').val(est.PRMCITY);
      $('#modal_PRMSTATE').val(est.PRMSTATE);
      $('#modal_PRMZIP').val(est.PRMZIP);
      $('#modal_LATITUDE').val(est.LATITUDEO);
      $('#modal_LONGITUDE').val(est.LONGITUDEO);

      $('#modal_LEMPSZCD_button').text(est.LEMPSZCD !== null ? est.LEMPSZCD : 'Emp Size');
      $('#modal_LEMPSZCD').val(est.LEMPSZCD);
      $('#modal_LEMPSZDS').val(est.LEMPSZDS);

      $('#modal_SQFOOTCD_button').text(est.SQFOOTCD !== null ? est.SQFOOTCD : 'SQF Code');
      $('#modal_SQFOOTCD').val(est.SQFOOTCD);
      $('#modal_SQFOOTDS').val(est.SQFOOTDS);

      $('#modal_LSALVOLCD_button').text(est.LSALVOLCD !== null ? est.LSALVOLCD : 'Sales Volume');
      $('#modal_LSALVOLCD').val(est.LSALVOLCD);
      $('#modal_LSALVOLDS').val(est.LSALVOLDS);
      $('#modal_ALSLSVOL').val(convertToMillionFromThousand(est.ALSLSVOL));

      $('#modal_CSALVOLCD_button').text(est.CSALVOLCD !== null ? est.CSALVOLCD : 'Corporate Sales Volume');
      $('#modal_CSALVOLDS').val(est.CSALVOLDS);
      $('#modal_ACSLSVOL').val(convertToMillionFromThousand(est.ACSLSVOL));

      $('#modal_MATCHCD').val(est.MATCHCD !== null ? est.MATCHCD : 'NULL');
      $('#modal_MATCHCD_button').text(
        est.MATCHCD !== null ? $(`#modal_MATCHCD li[value="${est.MATCHCD}"]`).text() : 'UNKNOWN'
      );

      // Sets the location container text to the address
      let address = `${est.PRMADDR}, ${est.PRMCITY}, ${est.PRMSTATE} ${est.PRMZIP} `;
      $('.modal_location_edit_container .header').html(
        `${address} - <span class='expand_header'><a href='#'>View</a></span>`
      );

      loadEditModal_eventListeners();
      $('#editModal .modal_location_edit_container .locate_addr').parent().hide();
    }, function(err) {
      alert('Query Error on ID');
      console.log(err);
    });

    function convertToMillionFromThousand(input) {
      if (!input) return null;
      return parseFloat(input) / 1000;
    }
  };

  // Load the event listeners for the editmodal.
  // Calls various helper function for range checking and automatic selection.
  function loadEditModal_eventListeners() {
    let form = $('#modal-form');
    form.unbind('submit').on('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      form[0].classList.add('was-validated');
      if (form[0].checkValidity() === true) {
        // alert('Sorry. Feature still in development.');
        sendBusinessEdit(); // Submit
      }
    });

    $('#submit_modal').unbind('click').click((e) => {
      e.preventDefault();
      e.stopPropagation();
      $('#modal-form').submit();
    });

    // Closes the modal and resets the form
    $('#editModal').unbind('hidden.bs.modal').on('hidden.bs.modal', function() {
      let form = $('#modal-form');
      // Revert changes done by modalShrink();
      $('#editModal .modal_expand').click();
      $('.modal_location_edit_container .content').hide();
      $('#modal_newaddress').html('');
      $('#modal_newaddress_container').hide();
      $('#modal_ALEMPSZ')[0].setCustomValidity('');
      $('#modal_ALSLSVOL')[0].setCustomValidity('');
      $('#modal_ACSLSVOL')[0].setCustomValidity('');
      form[0].classList.remove('was-validated');
      form[0].reset();
    });

    $('#modal_LEMPSZCD li').unbind('click').click(function() {
      let str = $(this).text();
      let chosen_LEMPSZCD, chosen_LEMPSZDS;
      let indexOfDash = str.indexOf('-');
      if (indexOfDash !== -1) {
        chosen_LEMPSZCD = str.slice(0, indexOfDash - 1);
        chosen_LEMPSZDS = str.slice(indexOfDash + 2);
      }
      $(this).parents('.dropdown').find('.btn').html(chosen_LEMPSZCD + ' <span class="caret"></span>');
      $(this).parents('.dropdown').find('.btn').val($(this).data('value'));
      $('#modal_LEMPSZDS').val(chosen_LEMPSZDS);
      // Check the range for actual employment size
      checkRangeEmply(chosen_LEMPSZDS);
      console.log('hello');
    });

    $('#modal_SQFOOTCD li').unbind('click').click(function() {
      let str = $(this).text();
      let chosen_SQFOOTCD, chosen_SQFOOTDS;
      let indexOfDash = str.indexOf('-');
      if (indexOfDash !== -1) {
        chosen_SQFOOTCD = str.slice(0, indexOfDash - 1);
        chosen_SQFOOTDS = str.slice(indexOfDash + 2);
      }
      $(this).parents('.dropdown').find('.btn').html(chosen_SQFOOTCD + ' <span class="caret"></span>');
      $(this).parents('.dropdown').find('.btn').val($(this).data('value'));
      $('#modal_SQFOOTDS').val(chosen_SQFOOTDS);
    });

    $('#modal_LSALVOLCD li').unbind('click').click(function() {
      let str = $(this).text();
      let chosen_LSALVOLCD, chosen_LSALVOLDS;
      let indexOfDash = str.indexOf('-');
      if (indexOfDash !== -1) {
        chosen_LSALVOLCD = str.slice(0, indexOfDash - 1);
        chosen_LSALVOLDS = str.slice(indexOfDash + 2);
      }
      $(this).parents('.dropdown').find('.btn').html(chosen_LSALVOLCD + ' <span class="caret"></span>');
      $(this).parents('.dropdown').find('.btn').val($(this).data('value'));
      $('#modal_LSALVOLDS').val(chosen_LSALVOLDS);
      // Check the range for actual sales volume
      checkRangeSales('#modal_LSALVOLCD', chosen_LSALVOLCD);
    });

    $('#modal_CSALVOLCD li').unbind('click').click(function() {
      let str = $(this).text();
      let chosen_CSALVOLCD, chosen_CSALVOLDS;
      let indexOfDash = str.indexOf('-');
      if (indexOfDash !== -1) {
        chosen_CSALVOLCD = str.slice(0, indexOfDash - 1);
        chosen_CSALVOLDS = str.slice(indexOfDash + 2);
      }
      $(this).parents('.dropdown').find('.btn').html(chosen_CSALVOLCD + ' <span class="caret"></span>');
      $(this).parents('.dropdown').find('.btn').val($(this).data('value'));
      $('#modal_CSALVOLDS').val(chosen_CSALVOLDS);
      // Check the range for actual sales volume
      checkRangeSales('#modal_CSALVOLCD', chosen_CSALVOLCD);
    });

    $('#modal_MATCHCD li').unbind('click').click(function() {
      let str = $(this).text();
      $(this).parents('.dropdown').find('.btn').html(str + ' <span class="caret"></span>');
      $('#modal_MATCHCD').val($(this).attr('value'));
    });

    // Bind listeners for automatic range selection and autofilling based on user input.
    $('#modal_ALEMPSZ').unbind('change').change(selectRange_ALEMPSZ);
    $('#modal_ALSLSVOL').unbind('change').change(selectRange_SalesVolume);
    $('#modal_ACSLSVOL').unbind('change').change(selectRange_SalesVolume);

    $('#modal_NAICSCD').unbind('change').change(autoFillText_modal);
    $('#modal_NAICSDS').unbind('change').change(autoFillText_modal);

    $('#modal_PRMSICCD').unbind('change').change(autoFillText_modal);
    $('#modal_PRMSICDS').unbind('change').change(autoFillText_modal);

    // Location Container Event Listener
    // Listener to expand the content inside location edit container
    $('.modal_location_edit_container .header .expand_header').unbind('click').click(() => {
      $content = $('.modal_location_edit_container .content');
      $content.slideToggle(500);
    });

    // $('#editModal .modal_location_edit_container .locate_addr').unbind('click').click(() => {
    //   // Create marker
    //   let lat = $('#modal_LATITUDE').val();
    //   let lon = $('#modal_LONGITUDE').val();
    //   locatePointByCoordinate(lat, lon);
    //   modalShrink();
    // });

    // $('#editModal .modal_location_edit_container .geocode_addr').unbind('click').click(() => {
    //   console.log('clicked geocode_addr');
    // });

    // $('#editModal .modal_expand').unbind('click').click(() => {
    //   // Remove the marker if it was set.
    //   removeSelectedBusinessMkr();
    //   modalExpand();
    // });

    // $('#editModal .modal_editLocation').unbind('click').click(() => {
    //   showLocationEditCtrl();
    //   // Editing mode
    //   let lat = $('#modal_LATITUDE').val();
    //   let lon = $('#modal_LONGITUDE').val();
    //   // editMarker is a local variable to hold editing data.
    //   editMarker = newDraggableMarkerByLatLon(lat, lon); // Map.js function
    //   let redIcon = new L.Icon({
    //     iconUrl: '/stylesheet/images/leaflet-color-markers/marker-icon-red.png',
    //     shadowUrl: '/stylesheet/images/leaflet-color-markers/marker-shadow.png',
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //     popupAnchor: [1, -34],
    //     shadowSize: [41, 41],
    //   });
    //   editMarker.setIcon(redIcon);
    //   editMarker.addTo(mymap);
    // });

    // $('#editModal .modal_editLocation_cancel').unbind('click').click(() => {
    //   hideLocationEditCtrl();
    //   removeMarker(editMarker);
    // });

    // $('#editModal .modal_editLocation_accept').unbind('click').click(() => {
    //   hideLocationEditCtrl();
    //   // editMarker is a local variable to hold editing data.
    //   let coord = editMarker.getLatLng();
    //   removeMarker(editMarker);
    //   locatePointByCoordinate(coord.lat, coord.lng);
    //   // Set lon and lat
    //   $('#modal_LATITUDE').val(coord.lat);
    //   $('#modal_LONGITUDE').val(coord.lng);
    // });
  }

  /*
   * Checks range for employment size and clicks the correct emply code.
   * The code selection triggers the click event which selects the correct
   * employment size description based on the code.
   * It then calls checkRangeEmply to validate input
   */
  function selectRange_ALEMPSZ() {
    let empszInput = $('#modal_ALEMPSZ').val().trim();
    empszInput = parseInt(empszInput, 10);
    if (isBetween(empszInput, 1, 4)) {
      $('#modal_LEMPSZCD li[value="A"]').click();
    } else if (isBetween(empszInput, 5, 9)) {
      $('#modal_LEMPSZCD li[value="B"]').click();
    } else if (isBetween(empszInput, 10, 19)) {
      $('#modal_LEMPSZCD li[value="C"]').click();
    } else if (isBetween(empszInput, 20, 49)) {
      $('#modal_LEMPSZCD li[value="D"]').click();
    } else if (isBetween(empszInput, 50, 99)) {
      $('#modal_LEMPSZCD li[value="E"]').click();
    } else if (isBetween(empszInput, 100, 249)) {
      $('#modal_LEMPSZCD li[value="F"]').click();
    } else if (isBetween(empszInput, 250, 499)) {
      $('#modal_LEMPSZCD li[value="G"]').click();
    } else if (isBetween(empszInput, 500, 999)) {
      $('#modal_LEMPSZCD li[value="H"]').click();
    } else if (isBetween(empszInput, 1000, 4999)) {
      $('#modal_LEMPSZCD li[value="I"]').click();
    } else if (isBetween(empszInput, 5000, 9999)) {
      $('#modal_LEMPSZCD li[value="J"]').click();
    } else if (isBetween(empszInput, 10000, Infinity)) {
      $('#modal_LEMPSZCD li[value="K"]').click();
    }
    checkRangeEmply($('#modal_LEMPSZDS').val());
  }

  /*
   * Checks range for sales volume and clicks the correct sales volume code.
   * The code selection triggers the click event which selects the correct
   * sales volume code description.
   * It then calls checkRangeSales to validate input
   * Can differentiate between 'ALSLVOL' and 'ACSLVOL'.
   */
  function selectRange_SalesVolume(e) {
    let element = e.target.id;
    let queryType = element.slice(6); // Takes out 'modal_'
    let slsvolInput;
    let targetElement;
    switch (queryType) {
      case 'ALSLSVOL':
        slsvolInput = $('#modal_ALSLSVOL').val().trim();
        targetElement = '#modal_LSALVOLCD';
        break;
      case 'ACSLSVOL':
        slsvolInput = $('#modal_ACSLSVOL').val().trim();
        targetElement = '#modal_CSALVOLCD';
        break;
    }
    slsvolInput = parseFloat(slsvolInput);
    slsvolInput = convertToThousandFromMillion(slsvolInput);
    if (isBetween(slsvolInput, 1, 499)) {
      $(targetElement + ' li[value="A"]').click();
    } else if (isBetween(slsvolInput, 500, 999)) {
      $(targetElement + ' li[value="B"]').click();
    } else if (isBetween(slsvolInput, 1000, 2499)) {
      $(targetElement + ' li[value="C"]').click();
    } else if (isBetween(slsvolInput, 2500, 4999)) {
      $(targetElement + ' li[value="D"]').click();
    } else if (isBetween(slsvolInput, 5000, 9999)) {
      $(targetElement + ' li[value="E"]').click();
    } else if (isBetween(slsvolInput, 10000, 19999)) {
      $(targetElement + ' li[value="F"]').click();
    } else if (isBetween(slsvolInput, 20000, 49999)) {
      $(targetElement + ' li[value="G"]').click();
    } else if (isBetween(slsvolInput, 50000, 99999)) {
      $(targetElement + ' li[value="H"]').click();
    } else if (isBetween(slsvolInput, 100000, 499999)) {
      $(targetElement + ' li[value="I"]').click();
    } else if (isBetween(slsvolInput, 500000, 999999)) {
      $(targetElement + ' li[value="J"]').click();
    } else if (isBetween(slsvolInput, 1000000, Infinity)) {
      $(targetElement + ' li[value="K"]').click();
    } else {
      checkRangeSales(targetElement, $(targetElement + '_button').text());
    }
  }

  /*
   * Takes the global associative array in loadautoComplete.js.
   * Checks for the user input (with autocomplete) and fills up the
   * description or code based on the NAICS/SIC selected.
   * Can differentiate between 'NAICS' and 'PRMSIC'.
   *
   * Dependencies: loadAutoComplete.js (two global array)
   */
  function autoFillText_modal(e) {
    let element = e.target.id;
    let queryType = element.slice(6, -2); // Takes out 'modal_' and last 2 chars
    let type = element.substr(-2); // Gets CD or DS
    let arr = [];
    let change_element; // Element to autofill
    let input;
    switch (queryType) {
      case 'NAICS':
        input = $('#' + element).val();
        if (type === 'CD') {
          arr = _obj_naics_arr[0];
          change_element = '#modal_NAICSDS';
        }
        if (type === 'DS') {
          arr = _obj_naics_arr[1];
          change_element = '#modal_NAICSCD';
        }
        if (arr[input]) $(change_element).val(arr[input]);
        break;
      case 'PRMSIC':
        input = $('#' + element).val();
        if (type === 'CD') {
          arr = _obj_sic_arr[0];
          change_element = '#modal_PRMSICDS';
        }
        if (type === 'DS') {
          arr = _obj_sic_arr[1];
          change_element = '#modal_PRMSICCD';
        }
        if (arr[input]) $(change_element).val(arr[input]);
        break;
    }
  }

  /*
   * Checks for employment size input if it falls within the range of the selected dropdown code.
   * Invalidates form if the input does not fall within range and validates the form if it is.
   *
   * Expected input:   - range {string}: desired range to check employment size. eg. 'A - 1-4'
   */
  function checkRangeEmply(range) {
    let indexOfDash = range.indexOf('-');
    let min = range.slice(0, indexOfDash);
    let max = range.slice(indexOfDash + 1);
    let input = $(modal_ALEMPSZ).val();
    let msg;

    if (min === '10000') max = Infinity;
    if ($('#modal_ALEMPSZ')[0].validity.patternMismatch) {
      // Invalid input not a number
      $('#modal_ALEMPSZ')[0].setCustomValidity('mismatch');
      msg = 'Please provide a valid employment Size';
      $('#modal_ALEMPSZ')[0].nextElementSibling.innerText = msg; // Next div with error message
    } else if (!isBetween(+input, +min, +max) && input) {
      // Invalid input for selected range
      $('#modal_ALEMPSZ')[0].setCustomValidity('not in range');
      msg = 'Please provide an Actual Size within range';
      $('#modal_ALEMPSZ')[0].nextElementSibling.innerText = msg; // Next div with error message
    } else {
      // Validation works or field is empty
      $('#modal_ALEMPSZ')[0].setCustomValidity('');
    }
  }

  /*
   * Checks for sales volume input if it falls within the range of the selected dropdown code.
   * Invalidates form if the input does not fall within range and validates the form if it is.
   * Can differentiate between 'LSALVOL' and 'CSALVOL'.
   *
   * Expected input:   - element {string}: desired div element to check. eg. '#modal_LSALVOLCD'
   *                   - code {string}: the chosen code range of the element. eg. 'A'
   */
  function checkRangeSales(element, code) {
    let input, checkElement;
    let min, max, msg;
    let queryType = element.slice(7, -2); // Takes out '#modal_' and last 2 chars
    switch (queryType) {
      case 'LSALVOL':
        checkElement = '#modal_ALSLSVOL';
        break;
      case 'CSALVOL':
        checkElement = '#modal_ACSLSVOL';
        break;
      default:
        console.log('No query type');
        return;
    }
    switch (code) {
      case 'A':
        min = 1;
        max = 499;
        break;
      case 'B':
        min = 500;
        max = 999;
        break;
      case 'C':
        min = 1000;
        max = 2499;
        break;
      case 'D':
        min = 2500;
        max = 4999;
        break;
      case 'E':
        min = 5000;
        max = 9999;
        break;
      case 'F':
        min = 10000;
        max = 19999;
        break;
      case 'G':
        min = 20000;
        max = 49999;
        break;
      case 'H':
        min = 50000;
        max = 99999;
        break;
      case 'I':
        min = 100000;
        max = 499999;
        break;
      case 'J':
        min = 500000;
        max = 999999;
        break;
      case 'K':
        min = 1000000;
        max = Infinity;
        break;
    }
    input = $(checkElement).val();
    input = convertToThousandFromMillion(input);
    if ($(checkElement)[0].validity.patternMismatch) {
      // Invalid input not a number
      $(checkElement)[0].setCustomValidity('mismatch');
      msg = 'Please provide a valid Sales Volume';
      $(checkElement)[0].nextElementSibling.innerText = msg; // Next div with error message
    } else if (!isBetween(+input, min, max) && input) {
      // Invalid input for selected range
      $(checkElement)[0].setCustomValidity('not in range');
      msg = 'Please provide a Sales Volume within range. Input = ' + toCommas(input + '000');
      $(checkElement)[0].nextElementSibling.innerText = msg; // Next div with error message
    } else {
      // Validation works or field is empty
      $(checkElement)[0].setCustomValidity('');
    }

    // Helper function that helps converting numbers to number with commas for error displaying purposes.
    function toCommas(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }

  // Helper function to check range
  function isBetween(x, min, max) {
    return x >= min && x <= max;
  }

  // Helper function that helps converting million into thousands for range checking
  function convertToThousandFromMillion(input) {
    if (!input) return null;
    if (isNaN(input)) return null;
    return parseFloat(input) * 1000;
  }

  function locateAddressWithGeocode() {
    var street_addr = $('#modal_PRMADDR').val();
    var city_addr = $('#modal_PRMCITY').val();
    var state_addr = $('#modal_PRMSTATE').val();
    var zip_addr = $('#modal_PRMZIP').val();

    // console.log(latitude + ' ' + longitude);

    // Parsing Street Address that comes from our DB for GeoSearch
    if (street_addr.trim() && city_addr.trim() && state_addr.trim() && zip_addr.trim()) {
      if (street_addr.match(/^\d/)) {
        var street_number = parseInt(street_addr, 10);
        street_addr = street_addr.replace(street_number, ''); // remove any numbers from the beginning
        street_addr = street_addr.replace('#', ''); // remove symbol '#' from address
        street_addr = street_addr.replace(/\d+$/, ''); // remove any numbers from the end
        street_addr = street_addr.trim(); // remove spaces from beginning and end
        street_addr = street_addr + ' ' + street_number;
      }

      // getting new coordinates
      $.get(
        location.protocol +
          '//nominatim.openstreetmap.org/search?format=json&accept-language=en' +
          '&limit=1' +
          '&q= ' +
          street_addr +
          ' ' +
          city_addr +
          ' ' +
          state_addr +
          ' ' +
          zip_addr,
        // We can also use this annotation below:
        // '//nominatim.openstreetmap.org/search?format=json&accept-language=en' +
        // '&street= ' + street_addr +
        // '&city= ' + city_addr +
        // '&state= ' + state_addr +
        // '&postalcode= ' + zip_addr,
        function(data) {
          data.map((est) => {
            //console.log(est.display_name + ' | lat: ' + est.lat + ' lon: ' + est.lon);
            // Locate using new latitude and longitude from GeoSearch library
            locatePointByCoordinate(est.lat, est.lon);
          });
        }
      );
    }

    /*
      // Adding a new marker for pointing to the new address
      var marker = new L.marker([latitude, longitude],{
          draggable: true
      }).addTo(mymap);
  
      marker.on('dragend', function (e) {
          var new_latitude = marker.getLatLng().lat;
          var new_longitude = marker.getLatLng().lng;
          console.log(new_latitude + ' ' + new_longitude);
      });
      */
  }

  function checkAddress() {
    var street_addr = $('#modal_PRMADDR').val();
    var city_addr = $('#modal_PRMCITY').val();
    var state_addr = $('#modal_PRMSTATE').val();
    var zip_addr = $('#modal_PRMZIP').val();

    // Parsing Street Address for GeoSearch
    if (street_addr.trim() && city_addr.trim() && state_addr.trim() && zip_addr.trim()) {
      if (street_addr.match(/^\d/)) {
        var street_number = parseInt(street_addr, 10);
        street_addr = street_addr.replace(street_number, ''); // remove any numbers from the beginning
        street_addr = street_addr.replace('#', ''); // remove symbol '#' from address
        street_addr = street_addr.replace(/\d+$/, ''); // remove any numbers from the end
        street_addr = street_addr.trim(); // remove spaces from beginning and end
        street_addr = street_addr + ' ' + street_number;
      }

      $.get(
        location.protocol +
          '//nominatim.openstreetmap.org/search?format=json&accept-language=en' +
          '&limit=1' +
          '&q= ' +
          street_addr +
          ' ' +
          city_addr +
          ' ' +
          state_addr +
          ' ' +
          zip_addr,
        function(data) {
          data.map((est) => {
            //Adding a new address under the old one
            $('#modal_newaddress').html('');
            $('#modal_newaddress').html(
              '<label><input id="modal_newaddress_checkbox" type="checkbox" value=""> ' +
                est.display_name +
                ' | lat: ' +
                est.lat +
                ' | lon: ' +
                est.lon +
                '</label>'
            );
            // Set value for hidden latutude and longitude inputs
            // $('#modal_LATITUDE').val(est.lat);
            // $('#modal_LONGITUDE').val(est.lon);
          });
        }
      );
    }

    $('#modal_newaddress_container').show();
  }

  function showLocationEditCtrl() {
    // Hide previous buttons
    $('#editModal .modal_expand_container').hide();
    // Show new buttons
    $('#editModal .modal_expand_container_editing').show();
  }

  function hideLocationEditCtrl() {
    // Hide edit buttons
    $('#editModal .modal_expand_container_editing').hide();
    // Show expand buttons
    $('#editModal .modal_expand_container').show();
  }
  function modalShrink() {
    // Hide everytab in main window
    $('.infoContainer, .advancedSearchContainer, .statisticsContainer, .legendContainer ').hide();
    // CSS changes below makes map active under the edit modal window
    $('#editModal').css({
      position: 'relative',
    });
    $('#editModal .modal-body').slideUp();
    $('#editModal .modal-footer').slideUp();

    if (!$('#editModal .modal.in').length) {
      $('.modal-dialog').css({
        top: 0,
        left: 0,
      });
    }

    $('#editModal').modal({
      backdrop: 'static',
      keyboard: false,
      show: true,
    });

    $('#editModal .modal-dialog').draggable({
      disabled: false,
      handle: '.modal-header',
    });
    $('#editModal .modal_expand_container').show();
  }

  function modalExpand() {
    // Show main windows
    $('.infoContainer, .advancedSearchContainer, .statisticsContainer, .legendContainer ').show();
    hideLocationEditCtrl(); // Just in case when modal is closed while editing.
    // Expand editModal and disable dragging
    $('#editModal').css({
      position: '',
    });
    $('#editModal .modal-body').slideDown();
    $('#editModal .modal-footer').slideDown();

    $('.modal-dialog').css({
      top: 0,
      left: 0,
    });

    // Check if there's a draggable instance
    if ($('#editModal .modal-dialog').draggable('instance')) {
      // If there is, destroy it
      $('#editModal .modal-dialog').draggable('destroy');
      // $('#editModal .modal-dialog').draggable('disable');
    }

    $('#editModal .modal_expand_container').hide();
  }
})();
