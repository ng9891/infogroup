(() => {
  let defaultMarkerRadius; // Default 0.1mi.
  let defaultRoadBufferSize; // Default 0.3mi.
  /**
   * Global variable.
   * Driver for query related to road query feature.
   * Including the sidebar functionality.
   * @param {integer} lat 
   * @param {integer} lon 
   */
  loadNearbyRoads = (lat, lon) => {
    defaultMarkerRadius = window.defaultMarkerRadius;
    defaultRoadBufferSize = window.defaultRoadBufferSize;
    toggleLoadingIcon();
    loadSideBarEventListener();
    openSideBar();
    loadSidebarData(lat, lon, defaultMarkerRadius);
    return;
  };

  /**
   * Road Sidebar event listener loader.
   */
  let loadSideBarEventListener = () => {
    $('.sideBarCloseBtn').unbind('click').on('click', () => {
      closeSideBar();
    });

    $('#roadDesc .backBtn').unbind('click').on('click', () => {
      closeRoadDescription();
    });

    $('.sideBarContent')
      .unbind('mouseover')
      .on('mouseover', '.query-result-list .road', function() {
        $(this).addClass('selected');
        let geometry = $(this).data('geom');
        if (geometry === 0) return;
        mymap.addLayer(geometry);
      })
      .unbind('mouseout')
      .on('mouseout', '.query-result-list .road', function() {
        $(this).removeClass('selected');
        let geometry = $(this).data('geom');
        if (geometry === 0) return;
        mymap.removeLayer(geometry);
      })
      .unbind('mousedown')
      .on('mousedown', '.query-result-list .road', function() {
        showRoadDescription($(this).data());
      });
  };
  /**
   * Creates a multilinestring from geojson object.
   * @param {JSON object} geoJSON 
   */
  let createLineFromJSON = (geoJSON) => {
    let lineStyle = {
      color: '#5cb85c',
      weight: 4,
      opacity: 0.8,
    };
    let geometry = JSON.parse(geoJSON).geometries[0];
    if (geometry.type === 'MultiLineString') {
      let lineString = L.geoJSON(geometry, {
        style: lineStyle,
        onEachFeature: () => {
          return;
        },
      });
      return lineString;
    }
    return 0;
  };
  /**
   * Makes a request with d3.json to server for nearby roads from lat and lng.
   * Data are binded to the DOM using JQUERY.data()
   * @param {integer} lat 
   * @param {integer} lon 
   * @param {integer} dist in miles.
   */
  let loadSidebarData = (lat, lon, dist) => {
    if (!lat || !lon) return;
    let ul = $('#sideBar .query-result-list');
    ul.empty();
    // Make API call
    let reqURL = `/api/getnearbyroad?lat=${lat}&lon=${lon}&dist=${dist}`;
    d3
      .json(reqURL)
      .then((data) => {
        if (data.data.length === 0) {
          $('<li>').text(`No road found in ${dist}mi.`).appendTo(ul);
        }
        toggleLoadingIcon();
        for (road of data.data) {
          let li = $('<li>')
            .addClass('road')
            .data({
              roadId: road.dot_id,
              geom: createLineFromJSON(road.geopoint),
              roadName: road.road_name,
              roadSigning: road.signing,
              roadNo: road.route_no,
              county: road.county_name,
            })
            .appendTo(ul);
          let p = $('<p>');
          if (road.signing === 'NONE') p.text(`${road.road_name}`).appendTo(li);
          else if (!road.road_name) p.html(`<strong>${road.signing}-${road.route_no}<strong>`).appendTo(li);
          else p.html(`${road.road_name} - <strong>${road.signing}-${road.route_no}<strong>`).appendTo(li);
        }
      })
      .catch((err) => {
        console.log(err);
        alert(`Query Error on finding nearby roads`);
      });
  };

  /**
   * Global function to close the road sidebar.
   */
  closeSideBar = () => {
    if ($('.mapContainer').hasClass('sideBar-open')) {
      $('.mapContainer').toggleClass('sideBar-open');
      window.setTimeout(() => {
        window.mymap.invalidateSize();
      }, 400);
      clearUsrMarker();
    }
  };

  /**
   * Function to open the road sidebar.
   */
  let openSideBar = () => {
    closeRoadDescription();
    if (!$('.mapContainer').hasClass('sideBar-open')) {
      $('.mapContainer').toggleClass('sideBar-open');
      window.setTimeout(() => {
        window.mymap.invalidateSize();
      }, 400);
    }
  };

  /**
   * Toggles the loading animation in the road sidebar.
   */
  let toggleLoadingIcon = () => {
    if ($('#sideBarLoader').css('display') == 'block') {
      $('#sideBarLoader').css('display', 'none');
    } else if ($('#sideBarLoader').css('display') == 'none') {
      $('#sideBarLoader').css('display', 'block');
    }
  };

  /**
   * Driver for description sidebar that is on top of road sidebar.
   * @param {Object} roadData Usually from DOM using jquery.data()
   */
  let showRoadDescription = (roadData) => {
    $('.sideBarContent').unbind('mouseout').unbind('mouseover');
    $('.sideBarCloseBtn').unbind('click');
    $('#roadDesc').addClass('open');
    loadRoadDescription(roadData);
    loadRoadDescriptionEventListener();
  };
  /**
   * Adds information to the road description sidebar.
   * @param {Object} roadData 
   */
  let loadRoadDescription = (roadData) => {
    let container = $('#roadDesc .roadDescContent');
    for (key in roadData) {
      if (key === 'geom') continue;
      let p = $('<p>').html(`<span class="key">${key}: </span>`).appendTo(container);
      if (!roadData[key]) roadData[key] = 'NONE';
      $('<span>').addClass(key).text(roadData[key]).appendTo(p);
    }
  };

  /**
   * Formats the data from the DOM to prepare it for establishments query.
   * @param {String} type 
   */
  let createQueryInputObj = (type) => {
    let descContent = $('#roadDesc .roadDescContent p');
    let queryInput = {};
    descContent.each(function() {
      let p = $(this);
      let key = p.children('span').first('span').text().trim().slice(0, -1);
      let val = p.children('span').last('span').text().trim();
      queryInput[key] = val;
    });
    if (queryInput['roadNo'] && queryInput['roadNo'] === 'NONE') delete queryInput['roadNo'];

    // Delete county in the input object so, it is not included in the requestURL
    if (type === 'id') if (queryInput['county']) delete queryInput['county'];

    queryInput['roadDist'] = window.defaultRoadBufferSize;
    return queryInput;
  };

  /**
   * Road Description Sidebar event listener loader.
   */
  let loadRoadDescriptionEventListener = () => {
    let query_version = d3.select('#version-dropdown').property('value');
    $('#roadDesc .queryRoadIDCounty').unbind('click').on('click', () => {
      let queryInput = createQueryInputObj('county');
      loadEstablishments('road', queryInput, query_version);
      removeSelectedRoadGeom();
    });

    $('#roadDesc .queryRoadID').unbind('click').on('click', () => {
      let conf = confirm('This query might take more than a minute. Do you want to continue?');
      if (conf === false) return;
      let queryInput = createQueryInputObj('id');
      loadEstablishments('road', queryInput, query_version);
      removeSelectedRoadGeom();
    });
  };

  /**
   * Called when road description sidebar is closed or when a query is confirmed.
   * Removes selected road from map.
   */
  let removeSelectedRoadGeom = () => {
    let selectedRoad = $('.sideBarContent .road.selected');
    if (selectedRoad.length === 0) return;
    mymap.removeLayer(selectedRoad.data('geom'));
    selectedRoad.removeClass('selected');
    loadSideBarEventListener();
  };

  /**
   * Handler for closing road description sidebar
   */
  let closeRoadDescription = () => {
    $('#roadDesc').removeClass('open');
    $('#roadDesc .roadDescContent').empty();
    // Remove Geom
    removeSelectedRoadGeom();
  };
})();
