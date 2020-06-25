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
    let option = {method: 'GET'};
    let savedOverlay = queryLayer[queryLayer.length - 1]; // Variable to hold current query layer.
    let reqURL, overlayURL, searchInfo, searchValue;
    if (queryType === 'zip' || queryType === 'mpo' || queryType === 'region') {
      reqURL = `/api/by${queryType}/${queryInput}?`;
      overlayURL = `/api/get${queryType}/${queryInput}?&limit=1`;
      searchInfo = queryType.toUpperCase();
      searchValue = queryInput;
    } else if (queryType === 'county') {
      searchInfo = queryType.toUpperCase();
      [reqURL, overlayURL, searchValue] = getCountyInfo(queryInput);
    } else if (queryType === 'mun') {
      [reqURL, overlayURL, searchInfo, searchType, searchValue] = getMunInfo(queryInput);
    } else if (queryType === 'adv' || queryType === 'road' || queryType === 'currLayer' || queryType === 'multiQuery') {
      searchInfo = 'Search:';
      [reqURL, overlayURL, searchValue] = getAdvSearchInfo(queryInput);
      if (overlayURL === 'geojson') {
        searchInfo = '';
        try {
          option = {
            method: 'POST',
            body: JSON.stringify(queryInput),
            headers: {
              'Content-type': 'application/json',
            },
          };
        } catch (e) {
          return console.log(e);
        }
      }
    } else if (queryType === 'draw') {
      [reqURL, overlayURL, searchInfo, searchValue] = getDrawInfo(queryInput); // userMarkers is a global var
    } else if (queryType === 'geocoding') {
      reqURL = `/api/bygeocode/${queryInput}?dist=${window.defaultRoadBufferSize}`;
      overlayURL = 'geocode';
      searchInfo = 'Geocode';
      searchValue = [null, queryInput + ` Dist: ${window.defaultRoadBufferSize}mi`];
    } else if (queryType === 'railroad') {
      let station = queryInput['station'];
      reqURL = `/api/by${queryType}?station=${station}&dist=${window.defaultRoadBufferSize}`;
      overlayURL = `/api/get${queryType}?station=${station}`;
      if (queryInput['route']) {
        reqURL += `&route=${queryInput['route']}`;
        overlayURL += `&route=${queryInput['route']}`;
      }
      searchInfo = queryType.toUpperCase();
      searchValue = [queryInput['input'], `Dist: ${window.defaultRoadBufferSize}mi`];
    } else {
      console.log('Invalid query type');
      return;
    }

    if (!reqURL) return alert(`Error in URL. ${searchInfo}`);
    // Add versioning.
    reqURL += `&v=${version}`;
    // console.log(reqURL, option);
    // reqURL = encodeURI(reqURL);
    // overlayURL = encodeURI(overlayURL);
    clearUiComponents(queryType);
    d3.select('.loader').classed('hidden', false);
    fetch(reqURL, option)
      .then((response) => {
        // throw Error
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Did not get a JSON response.
          throw new TypeError('Error querying current layer.');
        }
        if (!response.ok) throw new Error('Network response was not ok');
        let json = response.json();
        return json;
      })
      .then(async (data) => {
        if (data.data.length === 0) {
          await loadOverlay(data, overlayURL, savedOverlay);
          if (window.queryLayer.length > 0) window.mymap.fitBounds(window.queryLayer[0].getBounds());
          d3.select('.loader').classed('hidden', true);
          if (queryType === 'adv') {
            $('.advancedSearchContainer').toggleClass('open');
            $('#search-message').text('*No match found');
            $('#search-message').show();
          }
          searchInfo = `NOT FOUND ${searchInfo}`;
        } else {
          await loadUiComponents(data, overlayURL, savedOverlay);
          d3.select('.loader').classed('hidden', true);
        }
        updateSearchInfo(searchInfo, searchValue);
      })
      .catch((e) => {
        alert(e);
        return console.log(e);
      });

    // d3
    //   .json(reqURL, option)
    //   .then(async (data) => {
    //     if (data.data.length === 0) {
    //       await loadOverlay(data, overlayURL, savedOverlay);
    //       d3.select('.loader').classed('hidden', true);
    //       if (queryType === 'adv') {
    //         $('.advancedSearchContainer').toggleClass('open');
    //         $('#search-message').text('*No match found');
    //         $('#search-message').show();
    //       }
    //       searchInfo = `NOT FOUND ${searchInfo}`;
    //     } else {
    //       await loadUiComponents(data, overlayURL, savedOverlay);
    //       d3.select('.loader').classed('hidden', true);
    //     }
    //     updateSearchInfo(searchInfo, searchValue);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     alert(`Query Error on ${searchInfo}`);
    //   });
  };

  /**
   * Loads different components on the main page based on data.
   * 
   * @param {JSON Object} data 
   * @param {String} overlayURL 
   */
  let loadUiComponents = (data, overlayURL, savedOverlay) => {
    return Promise.all([
      loadMarkers(data),
      loadPieChart(data),
      loadDatatable(data),
      loadHistogram(data),
      loadOverlay(data, overlayURL, savedOverlay),
    ]).catch((err) => console.log(err));
  };
  /**
   * Clears different components on the main page.
   * @param {String} queryType 
   */
  let clearUiComponents = (queryType) => {
    // Reset pie chart logic to default.
    $('.togglePieBtn').text('MatchCD');
    $('.infoContainer #pieChartMatchCD').css('display', 'none');
    $('.infoContainer #pieChart').css('display', 'block');

    $('#pieChart').empty(); // Piechart
    $('#pieChartMatchCD').empty(); // Piechart
    d3.select('.hist').select('.svg').remove(); // Histogram

    // If its a drawing query, do not clear the drawings. Needed to draw overlay.
    if (queryType !== 'draw') {
      window.clearUsrMarker(); // function in map.js to clear user drawings
      // If its not a drawing query and its not a road query. Close the sidebar.
      // if (queryType !== 'road' && queryType !== 'multiQuery') window.closeSideBar(); // function in sideBar.js
      if (queryType === 'adv') $('.sideBarCloseBtn').click(); // function in sideBar.js
    }

    // Clearing queryOverlay in case of drawing query
    if (queryLayer.length > 0) {
      for (layer of queryLayer) {
        mymap.removeLayer(layer);
        layerControl.removeLayer(layer);
      }
      queryLayer = [];
    }
    // Clearing est markers
    mymap.removeLayer(matchCDClustermarkers); // Deselect matchCD
    layerControl.removeLayer(naicsClustermarkers);
    layerControl.removeLayer(matchCDClustermarkers);

    // Clearing markers in marker cluster.
    naicsClustermarkers.clearLayers();
    matchCDClustermarkers.clearLayers();
    clusterSubgroup.clearLayers();
    // Clear datatable
    window.clearDatatable(); // loadDatatable.js
    // window.destroyDatatable();

    // if (markerList.length > 0) {
    //   layerControl.removeLayer(markers);
    //   markers.clearLayers();
    //   markerList = [];
    // }
  };

  /**
   * Creates and add overlay layer to the map by calling addOverlayToMap() located in map.js
   * @param {JSON Object} data 
   * @param {String} overlayURL 
  */
  let loadOverlay = (data, overlayURL, savedOverlay) => {
    return new Promise(async (resolve, reject) => {
      let measurementOptions = {
        imperial: true,
      };
      if (!overlayURL) return resolve('Overlay not specified');
      let overlay;
      if (overlayURL === 'marker') {
        // Draw marker default radius of 1 mile.
        let layer = usrMarkers[usrMarkers.length - 1];
        let circle = L.circle([layer.getLatLng().lat, layer.getLatLng().lng], {radius: 1609}); // 1609.34m = 1 mile
        let circleCenter = L.marker([layer.getLatLng().lat, layer.getLatLng().lng]);
        overlay = L.layerGroup([circle, circleCenter]);
      } else if (overlayURL === 'circle') {
        // Create new circle / rectangle with different leafletid.
        let layer = usrMarkers[usrMarkers.length - 1];
        overlay = L.circle([layer.getLatLng().lat, layer.getLatLng().lng], {
          radius: layer.getRadius(),
          showMeasurements: true,
          measurementOptions: measurementOptions,
        }); // 1609.34m = 1 mile
      } else if (overlayURL === 'rectangle') {
        let layer = usrMarkers[usrMarkers.length - 1];
        overlay = L.rectangle(layer.getBounds(), {showMeasurements: true, measurementOptions: measurementOptions});
      } else if (overlayURL === 'polyline') {
        // Create Polyline from coordinate.
        let layer = usrMarkers[usrMarkers.length - 1].getLatLngs();
        let coordArr = [];
        for (const coord of layer) {
          coordArr.push([coord.lat, coord.lng]);
        }
        overlay = L.polyline(coordArr, {
          color: 'green',
          showMeasurements: true,
          measurementOptions: measurementOptions,
        });
      } else if (overlayURL === 'geocode') {
        // console.log('geocode');
        // Build JSON to match the app format.
        let builtGeoJsonToMatchFormat = {data: []};
        if (data.overlayJson) {
          // console.log(JSON.parse(data.overlayJson).features);
          let overlayFeatures = JSON.parse(data.overlayJson).features;
          for (let feature of overlayFeatures) {
            builtGeoJsonToMatchFormat.data.push({
              geom: feature.geometry,
              properties: feature.properties,
            });
          }
        }
        overlay = createGeoJsonOverlay(builtGeoJsonToMatchFormat);
      } else if (overlayURL === 'geojson') {
        overlay = savedOverlay;
      } else {
        // URL is provided to get overlay. Zip, County, Road.. etc.
        // Get Query layer/ bounding box
        overlayURL = encodeURI(overlayURL);
        let jsonOverlay = await d3.json(overlayURL).catch((err) => {
          return reject(err);
        });
        overlay = createGeoJsonOverlay(jsonOverlay);
      }
      if (!overlay) return resolve('Empty Overlay.');
      window.addOverlayToMap(overlay); // Function in map.js
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
    if (data.data.length < 1) {
      console.log('GeoJSON overlay is empty. - createGeoJsonOverlay()');
      return;
    }
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
      weight: 4,
      opacity: 0.5,
    };

    let overlay = L.geoJSON(l, {
      style: layerStyle,
      onEachFeature: onEachOverlayFeature,
    });

    if (overlayType) {
      // For now only roads feature displaying.
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
    if (!queryInput && !queryInput.county) return;
    reqURL = `/api/bycounty/${encodeURIComponent(queryInput.county)}?stateCode=${queryInput.stateCode}`;
    overlayURL = `/api/getcounty/${encodeURIComponent(queryInput.county)}?stateCode=${queryInput.stateCode}`;
    // Search criteria for display
    let searchValue = [];
    searchValue.push(queryInput.county + ' - ' + queryInput.stateCode);
    searchValue.push('');

    return [reqURL, overlayURL, searchValue];
  };
  /**
   * Gets the information from input to create an URL for the mun API request to the server.
   * @param {Object} queryInput 
   */
  let getMunInfo = (queryInput) => {
    if (!queryInput.mun) return;
    let searchInfo, searchType;
    let reqURL = `/api/bymun/${encodeURIComponent(queryInput.mun)}?`;
    let param = '';
    if (queryInput.type && queryInput.county) {
      param += '?munType=' + queryInput.type + '&county=' + encodeURIComponent(queryInput.county);
      reqURL += '&munType=' + queryInput.type + '&county=' + encodeURIComponent(queryInput.county);
      searchInfo = queryInput.type;
    } else {
      param += '?exact=1';
      searchInfo = 'Municipal';
    }
    let overlayURL = '/api/getmun/' + encodeURIComponent(queryInput.mun) + param;
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
    let naicsDS = queryInput.naicsDS;
    queryInput.naicsDS = '';
    let query = $.param(queryInput);
    let reqURL = '/api/search?' + query;
    let overlayURL = '';

    // Get overlay URL
    if (queryInput.geom) {
      // Query current query layer.
      reqURL = '/api/search?';
      overlayURL = 'geojson';
    } else if (queryInput.roadNo || queryInput.roadId) {
      // Road Query
      overlayURL = `/api/getRoad?roadNo=${queryInput.roadNo || ''}&county=${encodeURIComponent(queryInput.county) ||
        ''}&signing=${queryInput.roadSigning}&roadId=${queryInput.roadId}&mun=${encodeURIComponent(queryInput.mun) ||
        ''}&mpo=${encodeURIComponent(queryInput.mpo) || ''}`;
    } else {
      if (queryInput.mun != '') {
        overlayURL = '/api/getmun/' + encodeURIComponent(queryInput.mun);
      } else if (queryInput.county != '') {
        overlayURL = `/api/getcounty/${encodeURIComponent(queryInput.county)}?statecode=${queryInput.statecode || ''}`;
      } else if (queryInput.mpo != '') {
        overlayURL = '/api/getmpo/' + encodeURIComponent(queryInput.mpo);
      }
    }
    // Search criteria for display
    let roadDesc = '';
    if (!queryInput.roadSigning) queryInput.roadSigning = '';
    if (queryInput.roadSigning === 'NONE') {
      roadDesc = queryInput.roadName;
    } else {
      roadDesc = queryInput.roadSigning + queryInput.roadNo || '';
    }
    // if(queryInput.roadSigning === 'NONE')
    let firstRow = {
      Name: queryInput.coname || '',
      Road: roadDesc,
      MPO: queryInput.mpo || '',
      County: queryInput.county || '',
      Mun: queryInput.mun || '',
      MunType: queryInput.mun_type || '',
      MunCounty: queryInput.mun_county || '',
    };
    let secondRow = {
      Dist: queryInput.roadDist ? queryInput.roadDist + 'mi' : '',
      MatchCD: queryInput.matchCD || '',
      NAICS: naicsDS,
      // NAICS: queryInput.naicsds || '',
      SIC: queryInput.prmSicDs || '',
      EmpMin: queryInput.minEmp || '',
      EmpMax: queryInput.maxEmp || '',
      Sales: queryInput.lsalvol || '',
    };
    if (queryInput.dist) secondRow['Dist'] = queryInput.dist + 'mi';
    let arr_obj = [firstRow, secondRow];
    let searchValue = buildSearchValString(arr_obj);

    // Rollback previous adv search title when searching for current query layer.
    if (queryInput.prevTitle) {
      searchValue[0] = queryInput.prevTitle;
    }
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
      if (layer instanceof L.Polyline) {
        if (layer instanceof L.Rectangle) return 'rectangle';
        if (layer instanceof L.Polygon) return 'polygon';
        return 'polyline';
      }
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
      let rectangle = layer.getLatLngs();
      let maxLon = rectangle[0][0].lng;
      let maxLat = rectangle[0][0].lat;
      let minLon = rectangle[0][2].lng;
      let minLat = rectangle[0][2].lat;
      // Creates a request URL for the API
      reqURL = '/api/byrectangle';
      if (rectangle) {
        reqURL += '?minLon=' + minLon + '&minLat=' + minLat + '&maxLon=' + maxLon + '&maxLat=' + maxLat;
      }
      return reqURL;
    }

    function polylineQuery(lineCoord) {
      let params = 'coord=[';
      for (const [lat, lon] of lineCoord) {
        params += `[${lat},${lon}],`;
      }
      params = params.slice(0, -1); // Take out last comma.
      reqURL = '/api/bypolyline?' + params + ']&dist=' + window.defaultRoadBufferSize;
      return reqURL;
    }

    function drivingDistQuery(layer, directed = false) {
      let lat, lon, reqURL, overlayURL;
      lat = layer.getLatLng().lat;
      lon = layer.getLatLng().lng;
      // Creates a request URL for the API
      reqURL = `/api/bydrivingdist?dist=${window.defaultRoadBufferSize}&directed=${directed}`;
      overlayURL = `/api/getdrivingdist?dist=${window.defaultRoadBufferSize}&directed=${directed}`;
      if (lon) {
        reqURL += '&lon=' + lon;
        overlayURL += '&lon=' + lon;
        if (lat) {
          reqURL += '&lat=' + lat;
          overlayURL += '&lat=' + lat;
        }
      }
      return [reqURL, overlayURL];
    }

    if (layerArray.length === 0) return;

    let reqURL, overlayURL, searchValue, searchType;
    let layer = layerArray[layerArray.length - 1]; // last layer
    let latLon;
    switch (drawingType(layer)) {
      case 'marker':
        // reqURL = markerQuery(layer);
        // searchType = 'Marker Query';
        // searchValue = '1mi';
        // overlayURL = 'marker';
        [reqURL, overlayURL] = drivingDistQuery(layer);
        latLon = layer.getLatLng();
        searchType = `Driving Distance Query (${latLon.lat.toFixed(4)},${latLon.lng.toFixed(4)})`;
        searchValue = [``, `Dist:${window.defaultRoadBufferSize}mi`];
        break;
      case 'circle':
        reqURL = circleQuery(layer);
        searchType = 'Circle Query';
        let radius = layer.getRadius() * 0.00062137;
        latLon = layer.getLatLng();
        searchValue = [`(${latLon.lat.toFixed(4)},${latLon.lng.toFixed(4)}), R:${radius.toFixed(4)}mi`];
        overlayURL = 'circle';
        break;
      case 'rectangle':
        let center = layer.getBounds().getCenter();
        // Using the leaflet measure path library object to get the area.
        let measurementLayer = layer._measurementLayer._layers;
        let area = '0 ac';
        for (segment in measurementLayer) {
          if ((measurementLayer[segment]._title = 'Total area')) {
            area = measurementLayer[segment]._measurement;
          }
        }
        reqURL = rectangleQuery(layer);
        searchType = `Rectangle Query`;
        searchValue = [`(${center.lat.toFixed(4)},${center.lng.toFixed(4)}), A:${area}`];
        overlayURL = 'rectangle';
        break;
      case 'polyline':
        let lineCoord = layer.toGeoJSON().geometry.coordinates;
        if (lineCoord.length <= 0) return console.log('No line.');
        reqURL = polylineQuery(lineCoord);
        searchType = `Line`;
        searchValue = [
          `(${lineCoord[0][1].toFixed(4)},${lineCoord[0][0].toFixed(4)}) to (${lineCoord[
            lineCoord.length - 1
          ][1].toFixed(4)},${lineCoord[lineCoord.length - 1][0].toFixed(4)}), ${layer.totalLen || ''}mi`,
          ``,
        ];
        overlayURL = 'polyline';
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
    // if (!searchType) searchType = 'error';
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
