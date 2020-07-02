(() => {
  window._multiSearchQueryState = false; // Global variable to specify if it is a multiSearchQuery state.
  // Drawing options for leaflet showMeasurement plugin
  let drawingOptions = {
    showMeasurements: true,
    measurementOptions: {
      imperial: true,
    },
  };
  let turfBufferPadding = 0.35; // Turf buffer is a bit inaccurate, Error is around ~0.33mi for ESPG: 4326

  let bufferStyle = {color: 'yellow', opacity: 0.4};
  /**
   * Gets an approximation of the radius to draw for the turf buffer. As it is not accurate for version 06/12/2020
   * @param {Float} radius 
   */
  let getBufferRadius = (radius = 0.5) => {
    return radius * (1 + turfBufferPadding);
  };

  let isGeoJSONLayer = (layer) => {
    if (layer instanceof L.GeoJSON) return true;
    return false;
  };

  let isCircle = (layer) => {
    if (layer instanceof L.Circle) return true;
    return false;
  };

  let isRectangle = (layer) => {
    if (layer instanceof L.Polyline && layer instanceof L.Rectangle) return true;
    return false;
  };

  let IsLineString = (layer) => {
    if (layer instanceof L.Polyline) {
      if (!isRectangle(layer) && !(layer instanceof L.Polygon)) {
        return true;
      }
    }
    return false;
  };

  let getGeomType = (layer) => {
    if (layer instanceof L.Marker) return 'marker';
    if (layer instanceof L.Circle) return 'circle';
    if (layer instanceof L.GeoJSON) return 'geoJSON';
    if (layer instanceof L.Polyline) {
      if (layer instanceof L.Rectangle) return 'rectangle';
      if (layer instanceof L.Polygon) return 'polygon';
      return 'line';
    }
    return '';
  };

  let enableEditing = (layer) => {
    if (layer) {
      if (isGeoJSONLayer(layer)) layer.getLayers().forEach((l) => l.enableEdit());
      else layer.enableEdit();
    }
  };

  let disableEditing = (layer) => {
    if (layer) {
      if (isGeoJSONLayer(layer)) layer.getLayers().forEach((l) => l.disableEdit());
      else layer.disableEdit();
    }
  };

  let clearCurrentDrawing = () => {
    window.mymap.editTools.stopDrawing();
    usrMarkers.pop();
    drawnItems.clearLayers();
  };

  let getAPIURL = (input, inputType) => {
    let url, indexOfDash, county;
    switch (inputType) {
      case 'zip':
      case 'region':
      case 'mpo':
        url = `/api/get${inputType}/${encodeURIComponent(input)}?&limit=1`;
        break;
      case 'county':
        indexOfDash = input.lastIndexOf('-');
        inputObj = {};
        if (indexOfDash !== -1) {
          county = input.slice(0, indexOfDash - 1);
          let stateCode = input.slice(indexOfDash + 2);
          url = `api/get${inputType}/${encodeURIComponent(county)}?stateCode=${stateCode}`;
        }
        break;
      case 'mun':
        indexOfDash = input.indexOf('-');
        inputObj = {};
        if (indexOfDash !== -1) {
          let type = input.slice(indexOfDash + 2);
          let munType = type.slice(0, type.indexOf('/'));
          county = type.slice(type.indexOf('/') + 1);
          let mun = input.slice(0, indexOfDash - 1);
          url = `api/getmun/${encodeURIComponent(mun)}?munType=${munType}&county=${county}`;
        } else {
          inputObj['mun'] = input;
          url = `api/getmun/${encodeURIComponent(mun)}?exact=1`;
        }
        break;
      case 'railroad':
        let indexOfOpenParentheses = input.trim().lastIndexOf('(');
        if (indexOfOpenParentheses !== -1) {
          // Separate values from parentheses
          let station = input.trim().slice(0, indexOfOpenParentheses - 1);
          url = `/api/get${queryType}?station=${station}`;

          let route = input.slice(indexOfOpenParentheses + 1, -1);
          if (route !== 'LI' && route !== 'MN') route = route.split(',').join(' ');
          if (route) {
            url += `&route=${route}`;
          }
        }
        break;
    }
    return url;
  };

  let createGeoJsonLayer = (json) => {
    try {
      return L.geoJSON(json);
    } catch (e) {
      console.log(e);
      return '';
    }
  };

  /**
   * Helper function to create polyline and buffer.
   * Returns 3 geoms to make buffering changes easier. [L.Polyline, GeoJSON of the linestring, GeoJSON of the buffer]
   * @param {L.Polyline} layer Leaflet Linestring geometry.
   * @param {Float} radius distance to draw the buffer. (negative values are allowed)
   */
  let createLineAndBuffer = (layer, radius = 0.5) => {
    if (layer && IsLineString(layer)) {
      let layerCoord = layer.getLatLngs();
      let coordArr = [];
      let coordArrInv = [];
      for (const coord of layerCoord) {
        coordArr.push([coord.lng, coord.lat]);
        coordArrInv.push([coord.lat, coord.lng]);
      }
      let polyLine = L.polyline(coordArrInv, drawingOptions);
      let lineString = turf.lineString(coordArr);
      let bufferedLine = createGeoJsonLayer(turf.buffer(lineString, getBufferRadius(radius), {units: 'miles'}));
      return [polyLine, lineString, bufferedLine];
    }
  };

  /**
   * Helper function to get the desired geometry.
   * If it is a drawing inputType, will get the layer from usrMarkers array located in map.js
   * Returns an array of geoms.
   * LineString returns 3 geoms to make buffering changes easier. [L.Polyline, GeoJSON of the linestring, GeoJSON of the buffer]
   * @param {String} input 
   * @param {String} inputType 
   * @param {Leaflet Layer} inputLayer Layer to make copy on drawing layer. Not used if its an API request.
   */
  let getGeomFromInput = (input, inputType, inputLayer) => {
    return new Promise(async (resolve, reject) => {
      if (!inputType) return reject('Invalid InputType');
      let geom;
      if (inputType === 'circle') {
        if (!inputLayer) return reject('Invalid inputLayer');
        let latLng = inputLayer.getLatLng();
        let radius = inputLayer.getRadius();
        geom = L.circle([latLng.lat, latLng.lng], Object.assign({radius: radius}, drawingOptions));
      } else if (inputType === 'rectangle') {
        if (!inputLayer) return reject('Invalid inputLayer');
        geom = L.rectangle(inputLayer.getBounds(), drawingOptions);
      } else if (inputType === 'line') {
        if (!inputLayer) return reject('Invalid inputLayer');
        geom = inputLayer;
        return resolve(createLineAndBuffer(geom));
      } else if (inputType === 'geoJSON') {
        geom = createGeoJsonLayer(inputLayer.toGeoJSON());
      } else {
        if (!input) return reject('Invalid Input to get GEOM - API URL');
        let url = getAPIURL(input, inputType);
        if (!url) return reject('Error getting geomURL');
        let data = await d3.json(url).catch((e) => {
          console.log(e);
          return reject(e);
        });
        if (data) geom = createGeoJsonLayer(JSON.parse(data.data[0].geom));
      }
      return resolve([geom]);
    });
  };

  /**
   * Helper function to add a new geom/entry to multi-query-list
   * @param {String} name Name of the layer.
   * @param {String} type Type of layer.
   * @param {Array} layer Array of Leaflet layers.
   */
  let addNewEntryToMultiQueryList = (name = 'NoName', type = 'NoType', layer = []) => {
    let ul = $('.multi-query-list');
    let li = $('<li class="list-group-item clearfix">').addClass('geom').appendTo(ul);
    let deleteBtn = `<span class="deleteEntry"><i class="fas fa-trash-alt"></i></span>`;
    let p = $(`<p> 
      <span class="newOverlay_loading">
        <img alt="Loading..." src="/stylesheet/images/ui-anim_basic_16x16.gif" style=" margin-left: auto; margin-right: auto; display: block;">
      </span></p>`);
    p.appendTo(li);

    if (layer.length === 0) {
      p.empty().remove();
      $(`<p style="color:red;">${deleteBtn} Geometry not found: ${type.toUpperCase()} - ${name}.</p>`).appendTo(li);
    } else {
      // Create dynamically the edit buttons and buffer option depending on layer.
      let editingDiv = $(`<div class="row editLayerContainer" style="display:none;"></div>`);
      let bufferBoxDiv = $(`
        <div class="input-group input-group-sm col-12 mb-1 bufferInputGroup">
          <div class="input-group-prepend">
            <span class="input-group-text">Buffer</span>
          </div>
          <input type="text" class="form-control bufferInput" placeholder="in miles" value="0.5">
        </div>
      `);
      let editBtnDiv = $(`
        <div class="col-12 geomEditBtnContainer">
          <button class="btn btn-info btn-sm editBtn">Edit</button>
          <button class="btn btn-success btn-sm changeGroup saveBtn">Save</button>
          <button class="btn btn-danger btn-sm changeGroup cancelBtn">Cancel</button>
        </div>
      `);

      let geom = layer[0];
      li.data('geom', geom);
      window.multiQueryGroup.addLayer(geom);
      let id = window.multiQueryGroup.getLayerId(geom);
      let div = $(`<div class="geomInfo">${deleteBtn} ID: <b>${id}</b> | ${type.toUpperCase()} - ${name}</div>`);
      let popUpContent = `<b>ID: ${id}</b><br>Query Type: ${type.toUpperCase()}<br>Query Input: ${name}`;
      geom.bindPopup(popUpContent);
      // Add the linestring ID to the buffer for easy reference.
      if (IsLineString(geom)) {
        let lineString = layer[1];
        let buffer = layer[2];
        buffer.refLineStringID = id;
        buffer.refLineStringName = name;
        buffer.bindPopup(popUpContent);
        buffer.setStyle(bufferStyle);
        window.multiQueryGroup.addLayer(buffer);
        li.data('lineString', lineString);
        li.data('bufferGeom', buffer);
        bufferBoxDiv.appendTo(editingDiv);
      }
      window.mymap.addLayer(window.multiQueryGroup);
      mymap.fitBounds(geom.getBounds(), {padding: [100, 100]});
      p.empty().remove();

      editBtnDiv.appendTo(editingDiv);
      editingDiv.appendTo(div);
      div.appendTo(li);
    }

    $('.multi-query-addBtn').prop('disabled', true);
    // TODO: Check if repeated.
    let multiQueryLayers = window.multiQueryGroup.getLayers();
    if (multiQueryLayers.length > 0) $('.multi-query-searchBtn').prop('disabled', false);
  };

  /**
   * Callback for the autocomplete when an item is selected. Enables the add button.
   * @param {Event} e 
   * @param {Object} ui Contains information of selected item.
   */
  let autoCompleteSelectCB = (e, ui) => {
    $('.multi-query-addBtn').prop('disabled', false);
  };

  /**
   * Returns a geoJSON with all the geom in param layerGroup collected.
   * @param {*} layerGroup 
   */
  let collectFeatures = (layerGroup) => {
    let layers = layerGroup.getLayers();
    if (layers.length === 0) {
      alert('Error. Empty list/No geom found.');
      return;
    }
    // let featureGroup = new L.FeatureGroup(); // Separate layer control, although contains same layers(?);
    let arrOfLayers = [];
    for (layer of layers) {
      // TODO: Check if contain for faster query.
      let geoJSON;
      if (layer instanceof L.Circle) {
        let latLng = layer.getLatLng();
        let radius = layer.getRadius();
        geoJSON = turf.circle([latLng.lng, latLng.lat], radius / 1000, {units: 'kilometers'});
      } else {
        if (IsLineString(layer)) continue; // Dont add linestring. Buffer of the linestring is already added to multiQueryGroup.
        geoJSON = layer.toGeoJSON();
      }
      if (!geoJSON.features) {
        geoJSON = {
          type: 'FeatureCollection',
          features: [geoJSON],
        };
      }
      let coordinates = geoJSON.features[0].geometry.coordinates;
      if (coordinates[0].length && coordinates[0][0].length && !coordinates[0][0][0].length) {
        // Fixes error: The 'coordinates' in GeoJSON are not sufficiently nested.
        geoJSON.features[0].geometry.coordinates = [geoJSON.features[0].geometry.coordinates];
      }

      arrOfLayers.push(turf.multiPolygon(geoJSON.features[0].geometry.coordinates));
      // layer.addTo(featureGroup);
    }
    let collection = turf.featureCollection(arrOfLayers); // feature collection using TURF.js
    return collection;
  };

  /**
   * Helper Function that call loadEstablishment to load the markers for the specific drawn overlay.
   * @param {*} geoJSON 
   * @param {*} v 
   */
  let queryOverlay = (geoJSON, v = 'current') => {
    let formBody = {
      prevTitle: 'Multisearch',
      prevSubtitle: 'prevSubtitle',
      geom: geoJSON,
      v: v,
    };
    window.loadEstablishments('multiQuery', formBody, v);
  };

  let cancelAllEdit = () => {
    return new Promise((resolve) => {
      $('.multiple-query-container .multi-query-list .open .cancelBtn').each(async (i, val) => {
        await $(val).click();
      });
      return resolve();
    });
  };
  /**
   * MultiSearch Sidebar event listener loader.
   */
  let loadSideBarEventListener = () => {
    // Close sidebar listener
    $('.sideBarCloseBtn').unbind('click').on('click', () => {
      window._multiSearchQueryState = false;
      window.closeSideBar();
      $('.navBarSearch').show();
      $('.leaflet-control.leaflet-bar').show();
      clearList();
    });

    // Delete entry button listener
    $('#sideBar').unbind('click').on('click', '.deleteEntry', function(e) {
      // Eliminate geom.
      let li = $(this).parent().parent('li');
      let geom = li.data('geom');
      if (IsLineString(geom)) {
        let bufferGeom = li.data('bufferGeom');
        window.multiQueryGroup.removeLayer(bufferGeom);
      }
      window.multiQueryGroup.removeLayer(geom);
      let layers = window.multiQueryGroup.getLayers();
      if (layers.length === 0) $('.multi-query-searchBtn').prop('disabled', true); // Check if empty. If it is, disable search button.
      li.remove();
    });

    // Disable listeners from road query as it uses the same sidebar div.
    // $('.sideBarContent *').off();

    // List Mouseover, mouseout and click listener.
    $('.multiple-query-container')
      .unbind('mouseover')
      .on('mouseover', '.multi-query-list .geom', function() {
        $(this).addClass('selected');
        let geometry = $(this).data('geom');
        if (!geometry) return;
        geometry.setStyle({color: 'red'});
      })
      .unbind('mouseout')
      .on('mouseout', '.multi-query-list .geom', function() {
        $(this).removeClass('selected');
        let li = $(this);
        let geometry = li.data('geom');
        if (!geometry) return;
        let editContainer = li.find('.editLayerContainer');
        if (editContainer.hasClass('open') === false) geometry.setStyle({color: '#3388ff'});
      })
      .unbind('click')
      .on('click', '.multi-query-list .geom', function() {
        let li = $(this);
        li.addClass('selected');
        let geometry = li.data('geom');
        if (!geometry) return;
        li.find('.cancelBtn').click();
        let editContainer = li.find('.editLayerContainer');
        editContainer.toggleClass('open');
        editContainer.slideToggle(300);
        if (editContainer.hasClass('open')) geometry.setStyle({color: 'red'});
        else geometry.setStyle({color: '#3388ff'});
        geometry.bringToFront();
        mymap.fitBounds(geometry.getBounds(), {padding: [100, 100]});
      });

    // Clear button listener
    $('.multi-query-clear').unbind('click').on('click', () => {
      $('.multi-query-inputBox').val('');
      clearCurrentDrawing();
      clearList();
    });

    // Add button listener
    $('.multi-query-addBtn').unbind('click').on('click', async () => {
      let query_input = $('.multi-query-inputBox').val();
      let selectedQuery = $('#multi-query-dropdown').find(':selected');
      let query_type = selectedQuery.val();
      let layer = await getGeomFromInput(query_input, query_type, usrMarkers[usrMarkers.length - 1]).catch((e) => {
        return console.log(e);
      });
      addNewEntryToMultiQueryList(query_input, query_type, layer);
      clearCurrentDrawing();
      $('.multi-query-inputBox').val('');
    });

    // Search Button Listener
    $('.multi-query-searchBtn').unbind('click').on('click', async () => {
      // Cancel all changes to the geoms already on the list.
      await cancelAllEdit();
      let jsonToQuery = collectFeatures(window.multiQueryGroup);
      if (!jsonToQuery) return;
      let layerStyle = {
        weight: 4,
        opacity: 0.5,
      };
      queryLayer.push(createGeoJsonLayer(jsonToQuery).setStyle(layerStyle));
      queryOverlay(jsonToQuery);
    });

    // Input box listener
    // TODO: Add query versioning.
    let query_type, query_version;
    $('.multi-query-inputBox').on('focus', function() {
      query_type = $('#multi-query-dropdown').val();
      switch (query_type) {
        case 'zip':
          window.autoComplete_url('.multi-query-inputBox', 'zip', 2, autoCompleteSelectCB);
          break;
        case 'county':
          window.autoComplete_url('.multi-query-inputBox', 'county', 1, autoCompleteSelectCB);
          break;
        case 'mpo':
          window.autoComplete_url('.multi-query-inputBox', 'mpo', 0, autoCompleteSelectCB);
          $(this).autocomplete('search', $(this).val());
          break;
        case 'mun':
          window.autoComplete_url('.multi-query-inputBox', 'mun', 2, autoCompleteSelectCB);
          break;
        case 'railroad':
          window.autoComplete_url('.multi-query-inputBox', 'railroad', 2, autoCompleteSelectCB);
          break;
        case 'region':
          window.autoComplete_url('.multi-query-inputBox', 'region', 1, autoCompleteSelectCB);
          break;
        default:
          // Geocode
          if ($('.multi-query-inputBox').hasClass('ui-autocomplete-input')) {
            $('.multi-query-inputBox').autocomplete('destroy');
          }
      }
    });

    /**
     * Helper function to check if user selected same option in dropdown.
     * Also checks if its a drawing query. If it is, initiate drawing.
     * @param {DOM element} el Dropdown element.
     */
    function drawingQueryCheck(el) {
      let open = el.data('opened');
      if (open) {
        $('.multi-query-addBtn').prop('disabled', true);
        $('.multi-query-inputBox').val('');
        usrMarkers.pop();
        drawnItems.clearLayers();

        let selected = el.find(':selected');
        if (selected.hasClass('sidebar-draw')) {
          let drawingType = selected.val();
          if (drawingType === 'circle') {
            window.mymap.editTools.startCircle(null, drawingOptions);
          } else if (drawingType === 'rectangle') {
            window.mymap.editTools.startRectangle(null, drawingOptions);
          } else if (drawingType === 'line') {
            window.mymap.editTools.startPolyline(null, drawingOptions);
          }
        }
        el.data('opened', false);
      } else {
        el.data('opened', true);
      }
    }
    // Listener for drawing for multi-query-dropdown
    $('#multi-query-dropdown')
      .unbind('change')
      .on('change', function() {
        // New selection is selected. Continue as normal.
        let el = $(this);
        el.data('opened', true);
        drawingQueryCheck(el);
      })
      .unbind('click focus active')
      .on('click', function() {
        // Handles when user selects the same option in dropdown..
        drawingQueryCheck($(this));
      })
      .unbind('blur')
      .on('blur', function() {
        // Resets the flag variable.
        $(this).data('opened', false);
      });

    $('.multiple-query-container').on('click', '.multi-query-list .list-group-item .editLayerContainer *', function(e) {
      e.stopPropagation();
    });

    // Change the buffer radius as user types in the value for a linestring..
    $('.multiple-query-container').on('input', '.multi-query-list .list-group-item .bufferInput', function(e) {
      e.stopPropagation();
      let geom = $(this).closest('.geom').data('geom');
      if (!IsLineString(geom)) return;
      let radius = $(this).val();
      if (!radius || radius === '0') radius = 0;
      else radius = parseFloat(radius);

      let buffer = createLineAndBuffer(geom, radius)[2];
      let oldBuffer = $(this).closest('.geom').data('bufferGeom');
      if (oldBuffer) window.multiQueryGroup.removeLayer(oldBuffer);
      if (buffer) {
        let id = oldBuffer.refLineStringID;
        let name = oldBuffer.refLineStringName;
        let popUpContent = `<b>ID: ${id}</b><br>Query Type: LINE<br>Query Input: ${name}`;
        buffer.refLineStringID = id;
        buffer.refLineStringName = name;
        buffer.bindPopup(popUpContent);
        $(this).closest('.geom').data('bufferGeom', buffer);
        window.multiQueryGroup.addLayer(buffer.setStyle(bufferStyle));
      }
      $(this).closest('.geom').data('bufferRadius');
    });

    // Click listener for the Edit Button in editing tab
    $('.multiple-query-container').on('click', '.multi-query-list .list-group-item .editBtn', async function(e) {
      e.stopPropagation();
      let geom = $(this).closest('.geom').data('geom');
      if (geom) {
        let editGeom = $(this).closest('.geom').data('editingGeom');
        if (editGeom) window.multiQueryGroup.removeLayer(editGeom);
        window.multiQueryGroup.removeLayer(geom);
        window.multiQueryGroup.removeLayer($(this).closest('.geom').data('bufferGeom'));
        // Create new layer to edit and conserve old geom to cancel edit.
        let geomType = getGeomType(geom);
        if (!geomType) return console.log('Invalid geom type to edit.');
        let newEditGeom = await getGeomFromInput('', geomType, geom).catch((e) => {
          return console.log(e);
        });
        newEditGeom = newEditGeom[0];
        window.multiQueryGroup.addLayer(newEditGeom.setStyle({color: 'red'}));
        enableEditing(newEditGeom);
        $(this).closest('.geom').data('editingGeom', newEditGeom);
      }
    });

    // Click listener for the Save Button in editing tab
    $('.multiple-query-container').on('click', '.multi-query-list .list-group-item .saveBtn', function(e) {
      e.stopPropagation();
      let editGeom = $(this).closest('.geom').data('editingGeom');
      let geom;
      if (editGeom) {
        // Saves the edited layer as the geom.
        geom = editGeom;
        $(this).closest('.geom').data('geom', editGeom);
      }

      // If it is linestring, create the buffer.
      if (geom && IsLineString(geom)) {
        let oldBuffer = $(this).closest('.geom').data('bufferGeom');
        window.multiQueryGroup.removeLayer(oldBuffer);
        let id = oldBuffer.refLineStringID;
        let name = oldBuffer.refLineStringName;
        let popUpContent = `<b>ID: ${id}</b><br>Query Type: LINE<br>Query Input: ${name}`;

        let radius = $(this).parent().siblings('.bufferInputGroup').find('.bufferInput').val();
        let lineAndBufferGeom = createLineAndBuffer(geom, radius); // Creates a buffer with turf. Lat and lng are inversed compared to leaflet.
        let buffer = lineAndBufferGeom[2];
        buffer.setStyle(bufferStyle);
        buffer.refLineStringID = id;
        buffer.refLineStringName = name;
        buffer.bindPopup(popUpContent);
        window.multiQueryGroup.addLayer(buffer);
        $(this).closest('.geom').data('bufferGeom', buffer);
      }
      disableEditing(geom);
    });

    // Click listener for the Cancel Button in editing tab
    $('.multiple-query-container').on('click', '.multi-query-list .list-group-item .cancelBtn', function(e) {
      e.stopPropagation();
      let editGeom = $(this).closest('.geom').data('editingGeom');
      let originalGeom = $(this).closest('.geom').data('geom');
      if (editGeom) window.multiQueryGroup.removeLayer(editGeom);
      window.multiQueryGroup.addLayer(originalGeom);
      if (IsLineString(originalGeom)) {
        let buffer = $(this).closest('.geom').data('bufferGeom');
        window.multiQueryGroup.addLayer(buffer);
      }
      $(this).closest('.geom').data('editingGeom', null);
    });
  };

  // function to clear all the geom in multi query feature.
  let clearList = () => {
    $('ul.multi-query-list').empty();
    window.multiQueryGroup.clearLayers();
    $('.multi-query-searchBtn').prop('disabled', true);
  };

  /**
   * Global variable.
   * Driver for query related to multiple query feature.
   * Including the sidebar functionality from utils/sideBar.js.
   */
  window.loadMultiSearchSideBar = () => {
    window._multiSearchQueryState = true;
    window.toggleSideBarLoadingIcon();
    loadSideBarEventListener();
    window.openSideBar();

    // Disable UI
    $('.navBarSearch').hide();
    $('.leaflet-control.leaflet-bar').hide();
    if (!$('.infoContainer').hasClass('closed')) $('.infoContainer').addClass('closed');
    $('.leaflet-control-zoom').show();

    $('#sideBar .sideBarTitle').text('Multiple Search');
    $('#sideBar .multiple-query-container').show();
    $('#sideBar .query-result-list').hide();
    $('.multi-query-inputBox').val('');

    clearUsrMarker(); // Clear user drawn items before opening the sidebar.
    window.toggleSideBarLoadingIcon();

    window.mymap.addLayer(window.multiQueryGroup);
  };
})();
