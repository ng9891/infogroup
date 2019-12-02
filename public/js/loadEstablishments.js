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
  loadEstablishments = (queryType, queryInput, version = 'current') => {
    if (!queryType) return;

    let reqURL = `/api/by${queryType}/${queryInput}?v=${version}`;
    let overlayURL = `/api/get${queryType}/${queryInput}`;
    let searchInfo = queryType.toUpperCase();
    let searchValue = queryInput;

    if (queryType === 'mun') {
      reqURL = `/api/bymun/${queryInput.mun}?v=${version}`;
      let param = '';
      if (queryInput.type && queryInput.county) {
        param += '?munType=' + queryInput.type + '&county=' + queryInput.county;
        reqURL += '&munType=' + queryInput.type + '&county=' + queryInput.county;
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
      [reqURL, overlayURL, searchValue] = getAdvSearchInfo(queryInput);
    } else if (queryType === 'draw') {
      [reqURL, overlayURL, searchInfo, searchValue] = getDrawInfo();
    }
    d3.select('.loader').classed('hidden', false);
    clearComponents(queryType);
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
          await loadComponents(data, overlayURL);
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
    ]).catch((err) => console.log(err));
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
   * @param {Object{data:Array[]}} data 
   */
  let loadQueryOverlay = (data) => {
    return new Promise((resolve) => {
      if (queryLayer.length > 0) {
        let cLayer = queryLayer.pop();
        mymap.removeLayer(cLayer);
        layerControl.removeLayer(cLayer);
        queryLayer = [];
      }

      // console.log(data.data);
      let l = [];
      data.data.map((d) => {
        let dataObject = JSON.parse(d.geom);
        // If it is a road Query. Display info.
        if (d.signing)
          dataObject.properties = {
            gis_id: d.gis_id,
            gid: d.gid,
            dot_id: d.dot_id,
            road_name: d.road_name,
            route: d.route,
            county_name: d.county_name,
            muni_name: d.muni_name,
            mpo_desc: d.mpo_desc,
            signing: d.signing,
            fc: d.fc,
          };
        l.push(dataObject);
      });

      let layerStyle = {
        color: '#4169e1',
        weight: 4,
        opacity: 0.4,
      };

      let overlay = L.geoJSON(l, {
        style: layerStyle,
        onEachFeature: (feature, layer) => {
          if (feature.properties) {
            let popupContent = `
            <b>gis_id : ${feature.properties.gis_id}</b><br>
            gid : ${feature.properties.gid}<br>
            dot_id : ${feature.properties.dot_id}<br>
            Road_Name : ${feature.properties.road_name}<br>
            Route :  ${feature.properties.route}<br>
            County : ${feature.properties.county_name}<br>
            Municipality : ${feature.properties.muni_name}<br>
            MPO : ${feature.properties.mpo_desc}<br>
            Signing : ${feature.properties.signing}<br>
            FC : ${feature.properties.fc}
            `;
            layer.bindPopup(popupContent);
          }
        },
      }).on('click', function(e) {
        if (!data.data[0].signing) return;
        // Check for selected
        if (roadSelected) e.target.resetStyle(roadSelected); // Reset selected to default style
        // Assign new selected
        roadSelected = e.layer;
        // Bring selected to front
        roadSelected.bringToFront();
        // Style selected
        roadSelected.setStyle({
          color: 'red',
        });
      });
      queryLayer.push(overlay);
      mymap.addLayer(overlay);
      layerControl.addOverlay(overlay, 'Overlay Layer');
      resolve('Overlay Loaded');
    });
  };
  /**
   * 
   * @param {Object} queryInput 
   */
  let getAdvSearchInfo = (queryInput) => {
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
        overlayURL = '/api/getcounty/' + queryInput.county;
      } else if (queryInput.mpo != '') {
        overlayURL = '/api/getmpo/' + queryInput.mpo;
      }
    }
    // Search criteria for display
    if(!queryInput.roadSigning) queryInput.roadSigning = '';
    let firstRow = {
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
      $('.search-description').html('<h4>' + searchType + ' ' + searchValue[0] + '</h4> <h6>' + searchValue[1] + '</h6>');
    } else {
      $('.search-description').html('<h4>' + searchType + ' ' + searchValue + '</h4><h6></h6>');
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
