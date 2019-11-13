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
  loadEstablishments = (queryType, queryInput, version) => {
    if(!queryType) return;

    let reqURL = `/api/by${queryType}/${queryInput}?v=${version}`;
    let overlayURL = `/api/get${queryType}/${queryInput}`;
    let searchInfo = queryType.toUpperCase();
    let searchValue = queryInput;

    if (queryType === 'mun') {
      reqURL = `/api/bymun/${queryInput.mun}?v=${version}`;
      let param = '';
      if (queryInput.type && queryInput.county) {
        param += '?mun_type=' + queryInput.type + '&county=' + queryInput.county;
        reqURL += '&mun_type=' + queryInput.type + '&county=' + queryInput.county;
        searchInfo = queryInput.type;
      } else {
        param += '?exact=1';
        searchInfo = 'Municipal';
      }
      overlayURL = '/api/getmun/' + queryInput.mun + param;
      // Search criteria for display
      searchValue = [];
      searchValue.push(queryInput.mun);
      searchValue.push('County: ' + queryInput.county);
    } else if (queryType === 'adv') {
      searchInfo = 'Search:';
      let query = $.param(queryInput);
      reqURL = '/api/search?' + query;
      queryInput.query_version = version;
      if (queryInput.mun != '') {
        overlayURL = '/api/getmun/' + queryInput.mun;
      } else if (queryInput.county != '') {
        overlayURL = '/api/getcounty/' + queryInput.county;
      } else if (queryInput.mpo != '') {
        overlayURL = '/api/getmpo/' + queryInput.mpo;
      }
      // Search criteria for display
      let firstRow = {
        MPO: queryInput.mpo,
        County: queryInput.county,
        Mun: queryInput.mun,
        'Mun County': queryInput.mun_county,
      };
      let secondRow = {
        Industry: queryInput.industry,
        Code: queryInput.naicscd,
        EmpMin: queryInput.minEmp,
        EmpMax: queryInput.maxEmp,
        Sales: queryInput.lsalvol,
      };
      let arr_obj = [firstRow, secondRow];
      searchValue = buildSearchValString(arr_obj);
    } else if (queryType === 'draw') {
      [reqURL, overlayURL, searchInfo, searchValue] = getDrawInfo();
    }

    d3.select('.loader').classed('hidden', false);
    clearComponents(queryType);
    d3.json(reqURL).then(
      async (data) => {
        if (data.data.length === 0) {
          d3.select('.loader').classed('hidden', true);
          console.log('Query not found.');
          if (queryType === 'adv') {
            $('.advancedSearchContainer').toggleClass('open');
            $('#search-message').show().delay(5000).fadeOut();
          }
          searchInfo = `NOT FOUND ${searchInfo}`;
        } else {
          try {
            await loadComponents(data, overlayURL);
          } catch (err) {
            console.log(err);
          }
          d3.select('.loader').classed('hidden', true);
        }
        updateSearchInfo(searchInfo, searchValue);
      },
      (err) => {
        console.log(err);
        alert(`Query Error on ${searchInfo}`);
      }
    );
  };
  
  /**
   * Loads different components on the main page based on data.
   * 
   * @param {Array[Array[]]} data 
   * @param {String} overlayURL 
   */
  let loadComponents = (data, overlayURL) => {
    return Promise.all([
      loadMarkers(data),
      loadPieChart(data),
      loadDatatable(data),
      loadHistogram(data),
      queryOverlay(overlayURL),
    ]);
  };
  /**
   * Clears different components on the main page.
   * @param {String} queryType 
   */
  let clearComponents = (queryType) => {
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
   * Fetch data specified by overlayURL.
   * Calls loadQueryOverlay() if its a valid URL.
   * Loads circle if its a marker query.
   * @param {String} overlayURL 
   */
  let queryOverlay = (overlayURL) => {
    return new Promise((resolve, reject) => {
      if (!overlayURL) resolve('Overlay not specified');
      if (overlayURL === 'marker') {
        // Draw marker default radius of 1 mile.
        let layer = usrMarkers[usrMarkers.length - 1];
        let circle = L.circle([layer.getLatLng().lat, layer.getLatLng().lng], {radius: 1609}); // 1609.34m = 1 mile
        queryLayer.push(circle);
        mymap.addLayer(circle);
        layerControl.addOverlay(circle, 'Overlay Layer');
        resolve('Overlay Loaded');
      } else {
        //Get Query layer/ bounding box
        d3.json(overlayURL).then(
          async (data) => {
            await loadQueryOverlay(data);
            resolve('Overlay Loaded');
          },
          (err) => {
            reject(err);
          }
        );
      }
    });
  };
  /**
   * Function will add various overlays depending on the user query.
   *
   * Takes an object that contains the GeoJSON geometry of the queried area and
   * adds it into the queryLayer and mymap array.
   * Also adds the layer control button for the overlay.
   *
   * @param {Array[Array[]]} data 
   */
  let loadQueryOverlay = (data) => {
    return new Promise((resolve) => {
      if (queryLayer.length > 0) {
        let cLayer = queryLayer.pop();
        mymap.removeLayer(cLayer);
        queryLayer = [];
        layerControl.removeLayer(cLayer);
      }

      // console.log(data.data);
      var layer = [];
      data.data.map((d) => {
        layer.push(JSON.parse(d.geom));
      });

      let layerStyle = {
        color: '#4169e1',
        weight: 4,
        opacity: 0.4,
      };

      layer = L.geoJSON(layer, {
        style: layerStyle,
      });
      queryLayer.push(layer);
      mymap.addLayer(layer);
      layerControl.addOverlay(layer, 'Overlay Layer');
      resolve('Overlay Loaded');
    });
  };
  /**
   * Checks for the last layer of the user input and gets the coordinate for the layer.
   * returns [reqURL, overlayURL, searchType, searchValue] according to the drawing query.
   * 
   */
  let getDrawInfo = () => {
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

    if (usrMarkers.length === 0) return;

    let reqURL, overlayURL, searchValue, searchType;
    let layer = usrMarkers[usrMarkers.length - 1]; //last layer
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
        break;
      case 'rectangle':
        reqURL = rectangleQuery(layer);
        searchType = 'Rectangle Query';
        searchValue = '';
        break;
      case 'polygon':
        break;
      default:
        console.log('Error. Shape is not recognizable');
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
      $('.search-description').html('<h4>' + searchType + ' ' + searchValue[0] + '</h4> <p>' + searchValue[1] + '</p>');
    } else {
      $('.search-description').html('<h4>' + searchType + ' ' + searchValue + '</h4><p></p>');
    }
  };

  // Helper function to print the search value in '.search-description'
let buildSearchValString = (arr_obj) => {
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
})();
