(() => {
  let defaultMarkerRadius; // Default 0.1mi.
  let defaultRoadBufferSize; // Default 0.3mi.
  let lineStyle = {
    color: '#5cb85c',
    weight: 4,
    opacity: 0.8,
  };
  /**
   * Global variable.
   * Driver for query related to road query feature.
   * Including the sidebar functionality from utils/sideBar.js.
   * @param {integer} lat 
   * @param {integer} lon 
   */
  window.loadNearbyRoads = (lat, lon) => {
    defaultMarkerRadius = window.defaultMarkerRadius;
    defaultRoadBufferSize = window.defaultRoadBufferSize;
    window.toggleSideBarLoadingIcon();
    loadSideBarEventListener();
    window.closeRoadDescription();
    window.openSideBar();
    $('#sideBar2').hide();
    loadSidebarData(lat, lon, defaultMarkerRadius);
    return;
  };

  /**
   * Road Sidebar event listener loader.
   */
  let loadSideBarEventListener = () => {
    $('#sideBar .sideBarCloseBtn').unbind('click').on('click', () => {
      if(window._multiSearchQueryState){
        $('#sideBar2').show();
        $('#sideBar').hide();
        window.clearUsrMarker();
      }else{
        window.closeSideBar();
      }
    });

    $('#sideBar .sideBarContent')
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
    $('#sideBar .sideBarTitle').text('Query Results');
    $('#sideBar .multiple-query-container').hide();
    $('#sideBar').show();
    let ul = $('#sideBar .query-result-list');
    ul.show();
    ul.empty();
    // Make API call
    let reqURL = `/api/getnearbyroad?lat=${lat}&lon=${lon}&dist=${dist}`;
    d3
      .json(reqURL)
      .then((data) => {
        if (data.data.length === 0) {
          $('<li>').text(`No road found in ${dist}mi.`).appendTo(ul);
        }
        window.toggleSideBarLoadingIcon();
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
   * Driver for description sidebar that is on top of road sidebar.
   * @param {Object} roadData Usually from DOM using jquery.data()
   */
  let showRoadDescription = (roadData) => {
    $('#sideBar .sideBarContent').unbind('mouseout').unbind('mouseover');
    $('#sideBar .sideBarCloseBtn').unbind('click');
    $('#roadDesc').addClass('open');
    loadRoadDescription(roadData, window._multiSearchQueryState);
    loadRoadDescriptionEventListener();
  };
  /**
   * Adds information to the road description sidebar.
   * @param {Object} roadData 
   */
  let loadRoadDescription = (roadData, forMultiSearch = false) => {
    let container = $('#roadDesc .roadDescContent');
    container.data(roadData);
    container.data('currentGeom', roadData.geom); // Holds the currently displayed geom.
    for (key in roadData) {
      if (key === 'geom') continue;
      let p = $('<p>').html(`<span class="key">${key}: </span>`).appendTo(container);
      if (!roadData[key]) roadData[key] = 'NONE';
      $('<span>').addClass(key).text(roadData[key]).appendTo(p);
    }
    // Configure Tooltips on buttons.
    $('#roadDesc .resetRoad').attr('title', 'Reset road to default.');
    $('#roadDesc .displayWholeRoad').attr('title', 'Display the entire road.');
    $('#roadDesc .drawBBox').attr('title', 'Allows you to draw a rectangle to clip the displayed road.');
    $('#roadDesc .queryRoadLinestring').attr('title', 'Query the current shown Linestring on the map.');
    $('#roadDesc .queryRoadIDCounty').attr('title', 'Query on the road bounded by current county location.');
    $('#roadDesc .queryRoadID').attr('title', 'Query on the entire road. *Not normally recommended.');
    $('#roadDesc .addToMultiSearch').attr('title', 'Add current road configuration to the multiple search list.');

    if(forMultiSearch){
      $('#roadDesc .btnContainer .queryBtn').hide();
      $('#roadDesc .btnContainer .addBtn').show();
    }else{
      $('#roadDesc .btnContainer .queryBtn').show();
      $('#roadDesc .btnContainer .addBtn').hide();
    }
  };

  /**
   * Helper function to call API to get all segments of specified road ID.
   * Return a GeoJSON object.
   * @param {Number} roadId 
   */
  let getEntireRoadAsGeoJSON = (roadId) => {
    return new Promise(async (resolve, reject) => {
      if (!roadId) return reject('No roadId specified. (getEntireRoad)');
      let url = `/api/getroad?roadId=${roadId}`;
      let data = await d3.json(url).catch((e) => {
        console.log(e);
        return reject(e);
      });

      let layer = [];
      for (d of data.data) {
        let dataObject = d.geom;
        if (typeof d.geom === 'string') dataObject = JSON.parse(d.geom);
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
        layer.push(dataObject);
      }
      return resolve(layer);
    });
  };

  let createGeoJSONLayer = (geoJSON, style = lineStyle) => {
    let geoJsonlayer = L.geoJSON(geoJSON, {
      style: style,
    });
    return geoJsonlayer;
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

    $('#roadDesc .backBtn').unbind('click').on('click', () => {
      closeRoadDescription();
    });

    $('#roadDesc .resetRoad').unbind('click').on('click', () => {
      let data = $('#roadDesc .roadDescContent').data();
      let originalGeom = data.geom;
      if (data.currentGeom) window.mymap.removeLayer(data.currentGeom);
      window.mymap.addLayer(originalGeom);
      $('#roadDesc .roadDescContent').data('currentGeom', originalGeom);
    });

    $('#roadDesc .displayWholeRoad').unbind('click').on('click', async () => {
      $('#roadDesc .roadDescContent').hide();
      $('#roadDescLoader').show();
      let data = $('#roadDesc .roadDescContent').data();
      if (data.currentGeom) window.mymap.removeLayer(data.currentGeom);
      let layer = data.entireGeom;
      if (!layer) {
        let roadId = data.roadId;
        let geoJSON = await getEntireRoadAsGeoJSON(roadId).catch((e) => {
          return console.error(e);
        });
        layer = createGeoJSONLayer(geoJSON);
        $('#roadDesc .roadDescContent').data('entireGeom', layer);
      }
      $('#roadDesc .roadDescContent').data('currentGeom', layer);
      window.mymap.addLayer(layer);
      $('#roadDescLoader').hide();
      $('#roadDesc .roadDescContent').show();
    });

    $('#roadDesc .drawBBox').unbind('click').on('click', () => {
      let drawingOptions = {
        showMeasurements: true,
        measurementOptions: {
          imperial: true,
        },
      };
      window.mymap.editTools.startRectangle(null, Object.assign({kind: 'BBox'}, drawingOptions));
      $('#roadDesc .drawBBox').prop('disabled', true);
      $('#roadDesc .drawBtn').slideDown();
    });

    $('#roadDesc .confirmDraw').unbind('click').on('click', () => {
      $('#roadDesc .drawBtn').slideUp();
      let data = $('#roadDesc .roadDescContent').data();

      let bbox = drawnItems.getLayers()[0];
      let bboxCoord = bbox.getBounds();
      let minX = bboxCoord.getSouthWest().lng;
      let minY = bboxCoord.getSouthWest().lat;
      let maxX = bboxCoord.getNorthEast().lng;
      let maxY = bboxCoord.getNorthEast().lat;
      let turfBBox = [minX, minY, maxX, maxY]; // Left lower and Rigth upper corners.
      if (!data.currentGeom) return console.log('Error. No current Geom. (confirmDraw Btn)');
      window.mymap.removeLayer(data.currentGeom);
      let layer = data.currentGeom;

      let arrOfSegments = [];
      for (let feature of layer.toGeoJSON().features) {
        let coord;
        // Resolving issues of how turf manages geoJSON2
        if (feature.geometry.coordinates.length === 1) coord = feature.geometry.coordinates[0];
        else coord = feature.geometry.coordinates;

        let linestringSegment = turf.lineString(coord);
        let clipped = turf.bboxClip(linestringSegment, turfBBox);
        if (clipped.geometry.coordinates.length > 0) arrOfSegments.push(clipped);
      }

      let geomCollection = turf.featureCollection(arrOfSegments); // Contains linestring inside BBox.
      let newGeoJSONLayer = createGeoJSONLayer(geomCollection);
      window.mymap.addLayer(newGeoJSONLayer);
      $('#roadDesc .roadDescContent').data('currentGeom', newGeoJSONLayer);
      $('#roadDesc .roadDescContent').data('clippedGeom', newGeoJSONLayer);
      drawnItems.clearLayers();
      $('#roadDesc .drawBBox').prop('disabled', false);
    });

    $('#roadDesc .cancelDraw').unbind('click').on('click', () => {
      drawnItems.clearLayers();
      window.mymap.editTools.stopDrawing();
      $('#roadDesc .drawBtn').slideUp();
      $('#roadDesc .drawBBox').prop('disabled', false);
    });

    $('#roadDesc .queryRoadLinestring').unbind('click').on('click', () => {
      let query_version = d3.select('#version-dropdown').property('value');
      let data = $('#roadDesc .roadDescContent').data();
      let roadDesc;
      if (data.roadSigning && data.roadSigning !== 'NONE') roadDesc = `${data.roadSigning}${data.roadNo}`;
      else roadDesc = `${data.roadName}`;

      let overlay = createGeoJSONLayer(data.currentGeom.toGeoJSON(), {
        weight: 4,
        opacity: 0.5,
      });

      window.queryLayer.push(overlay);
      let queryInput = {
        prevTitle: `${roadDesc}`,
        dist: window.defaultRoadBufferSize,
        geom: overlay.toGeoJSON(),
      };
      loadEstablishments('currLayer', queryInput, query_version);
      removeSelectedRoadGeom();
    });

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

    $('#roadDesc .addToMultiSearch').unbind('click').on('click', () => {
      let data = $('#roadDesc .roadDescContent').data();

      let roadDesc;
      if (data.roadSigning && data.roadSigning !== 'NONE') roadDesc = `${data.roadSigning}${data.roadNo}`;
      else roadDesc = `${data.roadName}`;

      let overlay = createGeoJSONLayer(data.currentGeom.toGeoJSON());

      $('.multi-query-addBtn').prop('disabled', false);
      $('.multi-query-inputBox').val(roadDesc);

      usrMarkers.push(overlay);
      $('#sideBar').hide();
      $('#sideBar2').show();
      closeRoadDescription();
    });
  };

  /**
   * Called when road description sidebar is closed or when a query is confirmed.
   * Removes selected road from map.
   */
  let removeSelectedRoadGeom = () => {
    let selectedRoad = $('.sideBarContent .road.selected');
    if (selectedRoad.length === 0) return;
    // mymap.removeLayer(selectedRoad.data('geom'));
    let data = $('#roadDesc .roadDescContent').data();
    // window.mymap.removeLayer(selectedRoad.data('geom'));
    if (data.currentGeom) window.mymap.removeLayer(data.currentGeom);
    
    selectedRoad.removeClass('selected');
    loadSideBarEventListener();
  };

  /**
   * Handler for closing road description sidebar
   */
  window.closeRoadDescription = () => {
    removeSelectedRoadGeom(); // Remove Geom
    $('#roadDesc').removeClass('open');
    $('#roadDesc .roadDescContent').empty().removeData();
  };
})();
