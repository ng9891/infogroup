(() => {
  /**
   * Public function called whenever a query is made.
   * A query type needs to me specified accordingly.
   * 
   * In charge of loading/resetting all the components
   * 
   * @dependencies d3, map, loadEstablishments, loadHistogram, loadDatatable, loadPieChart
   * 
   * 
   * @param {String} queryType 
   * @param {String} queryInput
   * @param {String} version  
   */
  loadEstablishments = async (queryType, queryInput, version = 'current') => {
    if (!queryType) return;

    let reqURL, overlayURL, searchInfo, searchValue;
    if (queryType === 'zip' || queryType === 'mpo') {
      reqURL = `/api/by${queryType}/${queryInput}?`;
      overlayURL = `/api/get${queryType}/${queryInput}`;
      searchInfo = queryType.toUpperCase();
      searchValue = queryInput;
    }else if(queryType === 'county'){
      searchInfo = queryType.toUpperCase();
      [reqURL, overlayURL, searchValue] = getCountyInfo(queryInput);
    } else if (queryType === 'mun') {
      [reqURL, overlayURL, searchInfo, searchType, searchValue] = getMunInfo(queryInput);
    } else if (queryType === 'adv') {
      searchInfo = 'Search:';
      [reqURL, overlayURL, searchValue] = getAdvSearchInfo(queryInput);
    } else if (queryType === 'draw') {
      [reqURL, overlayURL, searchInfo, searchValue] = getDrawInfo(queryInput); // userMarkers is a global var
    } else if (queryType === 'geocoding') {
      reqURL = `/api/bygeocode/${queryInput}?`;
      overlayURL = 'json';
      searchInfo = 'Geocode';
      searchValue = [null, queryInput];
    } else {
      console.log('Invalid query type');
      return;
    }

    if (!reqURL) return alert(`Error in URL. ${searchInfo}`);
    // Add versioning.
    reqURL += `&v=${version}`;
    reqURL = encodeURI(reqURL);
    d3.select('.loader').classed('hidden', false);
    clearUiComponents(queryType);
    d3
      .json(reqURL)
      .then(async (data) => {
        if (data.data.length === 0) {
          d3.select('.loader').classed('hidden', true);
          if (queryType === 'adv') {
            $('.advancedSearchContainer').toggleClass('open');
            $('#search-message').show().delay(5000).fadeOut();
          }
          searchInfo = `NOT FOUND ${searchInfo}`;
        } else {
          await loadUiComponents(data, overlayURL);
          d3.select('.loader').classed('hidden', true);
        }
        updateSearchInfo(searchInfo, searchValue);
      })
      .catch((err) => {
        console.log(err);
        alert(`Query Error on ${searchInfo}`);
      });
  };

  /**
   * Loads different components on the main page based on data.
   * 
   * @param {JSON Object} data 
   * @param {String} overlayURL 
   */
  let loadUiComponents = (data, overlayURL) => {
    return Promise.all([
      loadMarkers(data),
      loadPieChart(data),
      loadDatatable(data),
      loadHistogram(data),
      loadOverlay(data, overlayURL),
    ]).catch((err) => console.log(err));
  };
  /**
   * Clears different components on the main page.
   * @param {String} queryType 
   */
  let clearUiComponents = (queryType) => {
    $('#pieChart').empty(); // Piechart
    clearDatatable(); // loadDatatable.js
    d3.select('.hist').select('.svg').remove(); // Histogram
    // If its a drwaing query, do not clear the drawings
    if (queryType !== 'draw') clearUsrMarker(); // function in map.js to clear user drawings

    // Clearing queryOverlay in case of drawing query
    if (queryLayer.length > 0) {
      let cLayer = queryLayer.pop();
      mymap.removeLayer(cLayer);
      queryLayer = [];
      layerControl.removeLayer(cLayer);
    }
    // Clearing est markers
    if (markerList.length > 0) {
      layerControl.removeLayer(markers);
      markers.clearLayers();
      markerList = [];
    }
  };

  /**
   * Creates and add overlay layer to the map by calling addOverlayToMap() located in map.js
   * @param {JSON Object} data 
   * @param {String} overlayURL 
  */
  let loadOverlay = (data, overlayURL) => {
    return new Promise(async (resolve, reject) => {
      if (!overlayURL) return resolve('Overlay not specified');
      let overlay;
      if (overlayURL === 'marker') {
        // Draw marker default radius of 1 mile.
        let layer = usrMarkers[usrMarkers.length - 1];
        overlay = L.circle([layer.getLatLng().lat, layer.getLatLng().lng], {radius: 1609}); // 1609.34m = 1 mile
      } else if (overlayURL === 'circle' || overlayURL === 'rectangle') {
        overlay = Object.assign(usrMarkers[usrMarkers.length - 1]); // Deep Copy
      } else if (overlayURL === 'json') {
        // Build JSON to match the app format.
        let builtGeoJsonToMatchFormat = {data: []};
        let overlayFeatures = JSON.parse(data.overlayJson).features;
        for (let feature of overlayFeatures) {
          builtGeoJsonToMatchFormat.data.push({
            geom: feature.geometry,
            properties: feature.properties,
          });
        }
        overlay = createGeoJsonOverlay(builtGeoJsonToMatchFormat);
      } else {
        //Get Query layer/ bounding box
        overlayURL = encodeURI(overlayURL);
        let jsonOverlay = await d3.json(overlayURL).catch((err) => {
          return reject(err);
        });
        overlay = createGeoJsonOverlay(jsonOverlay);
      }
      addOverlayToMap(overlay); // Function in map.js
      resolve('Overlay Loaded');
    });
  };
  /**
   * Creates the information displayed on each Feature on the Overlay Layer
   * @param {Leaflet Object} feature 
   * @param {Leaflet Object} layer 
   */
  let onEachOverlayFeature = (feature, layer) => {
    if (!feature.properties) return;
    let popupContent = ``;

    for (key in feature.properties) {
      if (key === 'icon' && layer instanceof L.Marker) {
        let customIcon = new L.Icon({
          iconSize: [24, 24],
          iconAnchor: [13, 24],
          popupAnchor: [1, -24],
          iconUrl: feature.properties['icon'],
        });
        layer.setIcon(customIcon);
        continue;
      }
      popupContent += `<b>${key}</b> : ${feature.properties[key]}<br>`;
    }
    layer.bindPopup(popupContent);
  };

  /**
   * Returns a geoJSON Leaflet Layer from input.
   * Created overlay layer will have a click listener if it contain properties.
   * onEachOverlayFeature() called when there is properties to display.
   * @param {JSON Object} data 
   */
  let createGeoJsonOverlay = (data) => {
    let l = [];
    let overlayType;
    data.data.map((d) => {
      let dataObject = d.geom;
      if (typeof d.geom === 'string') dataObject = JSON.parse(d.geom);
      // If it is a road Query. Display info.
      if (d.signing) {
        overlayType = 'road';
        dataObject.properties = {
          gis_id: d.gis_id,
          gid: d.gid,
          dot_id: d.dot_id,
          Road_Name: d.road_name,
          Route: d.route,
          County: d.county_name,
          Municipality: d.muni_name,
          MPO: d.mpo_desc,
          Signing: d.signing,
          FC: d.fc,
        };
      } else if (d.properties && d.properties.osm_id) {
        overlayType = 'geocoding';
        dataObject.properties = d.properties;
      }
      l.push(dataObject);
    });

    let layerStyle = {
      color: '#4169e1',
      weight: 4,
      opacity: 0.5,
    };

    let overlay = L.geoJSON(l, {
      style: layerStyle,
      onEachFeature: onEachOverlayFeature,
    });

    if (overlayType) {
      overlay.on('click', (e) => {
        // Check for selected
        if (featureSelected) e.target.resetStyle(featureSelected); // Reset selected to default style
        // Assign new selected
        featureSelected = e.layer;
        // If it's not a point.
        if (!(featureSelected instanceof L.Marker)) {
          // Bring selected to front
          featureSelected.bringToFront();
          // Style selected
          featureSelected.setStyle({
            color: 'red',
          });
        }
      });
      overlay.on('popupclose', (e) => {
        if (featureSelected) e.target.resetStyle(featureSelected);
      });
    }
    return overlay;
  };
  let getCountyInfo = (queryInput) => {
    if(!queryInput && !queryInput.county) return;
    reqURL = `/api/bycounty/${queryInput.county}?stateCode=${queryInput.stateCode}`;
    overlayURL = `/api/getcounty/${queryInput.county}?stateCode=${queryInput.stateCode}`;
    // Search criteria for display
    let searchValue = [];
    searchValue.push(queryInput.county);
    searchValue.push('State: ' + queryInput.stateCode);

    return [reqURL, overlayURL, searchValue];
  };
  /**
   * Gets the information from input to create an URL for the mun API request to the server.
   * @param {Object} queryInput 
   */
  let getMunInfo = (queryInput) => {
    if (!queryInput.mun) return;
    let searchInfo, searchType;
    let reqURL = `/api/bymun/${queryInput.mun}?`;
    let param = '';
    if (queryInput.type && queryInput.county) {
      param += '?munType=' + queryInput.type + '&county=' + queryInput.county;
      reqURL += '&munType=' + queryInput.type + '&county=' + queryInput.county;
      searchInfo = queryInput.type;
    } else {
      param += '?exact=1';
      searchInfo = 'Municipal';
    }
    let overlayURL = '/api/getmun/' + queryInput.mun + param;
    // Search criteria for display
    let searchValue = [];
    searchValue.push(queryInput.mun);
    searchValue.push('County: ' + queryInput.county);

    return [reqURL, overlayURL, searchInfo, searchType, searchValue];
  };
  /**
   * 
   * @param {Object} queryInput 
   */
  let getAdvSearchInfo = (queryInput) => {
    if (typeof queryInput !== 'object') return;
    let query = $.param(queryInput);
    let reqURL = '/api/search?' + query;
    let overlayURL = '';
    // Road Query
    if (queryInput.roadNo != '') {
      overlayURL = `/api/getRoad?roadNo=${queryInput.roadNo}&county=${queryInput.county}&\
signing=${queryInput.roadSigning}&gid=${queryInput.roadGid}`;
    } else {
      if (queryInput.mun != '') {
        overlayURL = '/api/getmun/' + queryInput.mun;
      } else if (queryInput.county != '') {
        overlayURL = `/api/getcounty/${queryInput.county}?statecode=${queryInput.statecode || ''}`;
      } else if (queryInput.mpo != '') {
        overlayURL = '/api/getmpo/' + queryInput.mpo;
      }
    }
    // Search criteria for display
    if (!queryInput.roadSigning) queryInput.roadSigning = '';
    let firstRow = {
      Name: queryInput.coname || '',
      Road: queryInput.roadSigning + queryInput.roadNo || '',
      MPO: queryInput.mpo || '',
      County: queryInput.county || '',
      Mun: queryInput.mun || '',
      MunType: queryInput.mun_type || '',
      MunCounty: queryInput.mun_county || '',
    };
    let secondRow = {
      Dist: queryInput.roadDist || '',
      NAICS: queryInput.naicsds || '',
      Code: queryInput.naicscd || '',
      EmpMin: queryInput.minEmp || '',
      EmpMax: queryInput.maxEmp || '',
      Sales: queryInput.lsalvol || '',
    };
    let arr_obj = [firstRow, secondRow];
    let searchValue = buildSearchValString(arr_obj);
    return [reqURL, overlayURL, searchValue];
  };
  /**
   * Identifies the type of drawing the user made and creates the API URL to make the request.
   * The drawn layer is in global variable userMarkers.
   * returns [reqURL, overlayURL, searchType, searchValue] according to the drawing query.
   * @param {Array} queryInput 
   */
  let getDrawInfo = (layerArray) => {
    //Helper functions to check the type of drawing
    function drawingType(layer) {
      if (layer instanceof L.Marker) return 'marker';
      if (layer instanceof L.Circle) return 'circle';
      if (layer instanceof L.Rectangle) return 'rectangle';
      if (layer instanceof L.Polygon) return 'polygon';
    }

    // Helper functions that creates the URL for marker query
    function markerQuery(layer) {
      let lat, lon, reqURL;
      lat = layer.getLatLng().lat;
      lon = layer.getLatLng().lng;
      // Creates a request URL for the API
      reqURL = '/api/bydistance';
      if (lon) {
        reqURL += '?lon=' + lon;
        if (lat) {
          reqURL += '&lat=' + lat;
        }
      }
      return reqURL;
    }
    // Helper functions that creates the URL for circle query
    function circleQuery(layer) {
      let lat, lon, dist, reqURL;
      lat = layer.getLatLng().lat;
      lon = layer.getLatLng().lng;
      dist = layer.getRadius();
      // Creates a request URL for the API
      reqURL = '/api/bydistance';
      if (lon) {
        reqURL += '?lon=' + lon;
        if (lat) {
          reqURL += '&lat=' + lat;
          if (dist) {
            reqURL += '&dist=' + dist;
          }
        }
      }
      return reqURL;
    }
    // Helper functions that creates the URL for rectangle query
    function rectangleQuery(layer) {
      var rectangle = layer.getLatLngs();

      var maxLon = rectangle[0][0].lng;
      var maxLat = rectangle[0][0].lat;

      var minLon = rectangle[0][2].lng;
      var minLat = rectangle[0][2].lat;

      // Creates a request URL for the API
      reqURL = '/api/byrectangle';
      if (rectangle) {
        reqURL += '?minLon=' + minLon + '&minLat=' + minLat + '&maxLon=' + maxLon + '&maxLat=' + maxLat;
      }
      return reqURL;
    }

    if (layerArray.length === 0) return;

    let reqURL, overlayURL, searchValue, searchType;
    let layer = layerArray[layerArray.length - 1]; // last layer
    switch (drawingType(layer)) {
      case 'marker':
        reqURL = markerQuery(layer);
        searchType = 'Marker Query';
        searchValue = '1mi';
        overlayURL = 'marker';
        break;
      case 'circle':
        reqURL = circleQuery(layer);
        searchType = 'Circle Query';
        let radius = layer.getRadius() * 0.00062137;
        searchValue = radius.toFixed(4) + 'mi';
        overlayURL = 'circle';
        break;
      case 'rectangle':
        reqURL = rectangleQuery(layer);
        searchType = 'Rectangle Query';
        searchValue = '';
        overlayURL = 'rectangle';
        break;
      case 'polygon':
        break;
      default:
        console.log('Error. Shape is not recognizable');
        searchType = 'Error. Shape is not recognizable';
        searchValue = '';
        return;
    }
    return [reqURL, overlayURL, searchType, searchValue];
  };
  /**
   * Helper function that targets 'search-description' div element to change its description based on the query search.
   * 
   * If this function is called from an advanced search query, searchValue will be an array[2] that contains a longer description of the query.
   * Reason to send it as an array so its easier to separate the description into a smaller paragraph.
   * @param {String} searchType 
   * @param {Array} searchValue 
   */
  let updateSearchInfo = (searchType, searchValue) => {
    if (!searchType) searchType = 'error';
    if (!searchValue) searchValue = '';
    if (Array.isArray(searchValue)) {
      // Different description loading for advances search as it sends an array
      $('.search-description').html(`<h4>${searchType} ${searchValue[0] || ''}</h4> <h6>${searchValue[1] || ''}</h6>`);
    } else {
      $('.search-description').html(`<h4>${searchType} ${searchValue || ''}</h4> <h6></h6>`);
    }
  };

  // Helper function to print the search value in '.search-description'
  let buildSearchValString = (arr_obj) => {
    let arr_str = [];
    // For search info and search value.
    arr_obj.map((obj) => {
      let key_arr = Object.keys(obj);
      let string = '';
      let filtered_key_arr = key_arr.filter((k) => {
        return obj[k] != '';
      });
      // Format it as county: kings,
      filtered_key_arr.map((k, i) => {
        if (obj[k]) {
          string += ` ${k}: ${obj[k]}`;
          if (i < filtered_key_arr.length - 1) string += ',';
        }
      });
      arr_str.push(string);
    });
    return arr_str;
  };
})();
