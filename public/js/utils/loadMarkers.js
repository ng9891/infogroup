/*
* Description OUTDATED
* Function will create a marker in mymap for any points inside the parameter 'establishments'
* Previous markers and overlay layers will be cleared.
* The color of the markers will be decided by their repective NAICS code.
* Dependencies:	- naicsKeys.js that contains a look up color scheme depending on NAICS code.
*				- variable 'layerControl' of type L.control.layers
*       - variable 'mymap'
*       - variable 'querylayer' from Drawing Queries.
*       - variable 'markers' from ClusterPlugin
* Expected input: an object with an array of JSON object called 'data'
* Output: Markers will be added into mymap and markerList array 
*/
// Building map filtering layer for NAICS and MatchCD
let _matchcdLayers = {};
let _naicsLayers = {};
(() => {
  function buildNaicsLayerObj(twoDigitNaics) {
    let codes = Object.keys(twoDigitNaics);
    let tmp = {};
    for (let twoDigit of codes) {
      tmp[twoDigit] = {
        layer: L.featureGroup.subGroup(clusterSubgroup), // Subgroup plugin
        markers: [],
      };
    }
    tmp[99] = {
      layer: L.featureGroup.subGroup(clusterSubgroup),
      markers: [],
    };
    return tmp;
  }
  function buildMatchCDLayerObj(matchCDObj) {
    // let codes = Object.keys(_matchCDObj);
    let tmp = {};
    for (let k in matchCDObj) {
      tmp[k] = {
        layer: L.featureGroup.subGroup(clusterSubgroup),
        markers: [],
      };
    }
    return tmp;
  }

  loadMarkers = (establishments) => {
    return new Promise((resolve) => {
      // Variable to calculate bounding box
      let lats = [];
      let lngs = [];

      _naicsLayers = buildNaicsLayerObj(twoDigitNaics);
      _matchcdLayers = buildMatchCDLayerObj(_matchCDObj);

      establishments = establishments.data.map((est) => {
        est.geopoint = JSON.parse(est.geopoint);
        // get two digit code
        let twoDigitCode = null;
        if (est.NAICSCD) {
          twoDigitCode = est.NAICSCD.toString().slice(0, 2);
        }
        // check if coordinate exist
        if (est.geopoint.coordinates[1] && est.geopoint.coordinates[0]) {
          // add to array for bounding box
          lats.push(est.geopoint.coordinates[1]);
          lngs.push(est.geopoint.coordinates[0]);
          let naicsColor = naicsKeys[twoDigitCode] ? naicsKeys[twoDigitCode].color : 'black';
          let matchCDColor = _matchCDColorScheme[est.MATCHCD] ? _matchCDColorScheme[est.MATCHCD] : 'black';

          let markerNAICS = styleMarker(est, naicsColor);
          _naicsLayers[twoDigitCode].markers.push(markerNAICS);
          markerNAICS.addTo(_naicsLayers[twoDigitCode].layer); // Add marker to subgroup

          if (!est.MATCHCD) est.MATCHCD = 'NULL';
          let markerMatchCD = styleMarker(est, matchCDColor);
          _matchcdLayers[est.MATCHCD].markers.push(markerMatchCD);
          markerMatchCD.addTo(_matchcdLayers[est.MATCHCD].layer); // Add marker to subgroup

          naicsClustermarkers.addLayer(markerNAICS);
          matchCDClustermarkers.addLayer(markerMatchCD);
        }
      });

      mymap.addLayer(naicsClustermarkers); // Show NAICS on map as default.
      // Layer control
      layerControl.addOverlay(naicsClustermarkers, 'Establishments - NAICS');
      layerControl.addOverlay(matchCDClustermarkers, 'Establishments - MatchCD');
      // calculate the bounding Box
      bbox = [[d3.min(lats), d3.min(lngs)], [d3.max(lats), d3.max(lngs)]];

      mymap.fitBounds(bbox);
      resolve('Map Loaded');
    });
  };

  function styleMarker(est, color, filter) {
    // --
    // employee scale
    // 1 - 1000 employees
    // mapped to 5 - 30 pixel width
    // --
    let employmentScale = d3.scaleLinear().domain([1, 999]).range([7, 15]);

    // get markerRadius
    let circleRadius = est.ALEMPSZ ? employmentScale(+est.ALEMPSZ) : 7;
    circleRadius = circleRadius.toFixed(2);

    // --
    // Create divIcon
    // http://leafletjs.com/reference-1.3.0.html#divicon
    // --
    let myIcon = L.divIcon({
      className: 'current-location-icon',
      html: `
      <div id="${encodeURIComponent(est.id)}" 
        class = "NAICS" 
            style="
              width:${circleRadius}px;
              height:${circleRadius}px;
              background-color:${color};
              border-radius:500px;"
          ></div>`,
      iconAnchor: [0, 0],
      iconSize: null,
      popupAnchor: [0, 0],
      id: encodeURIComponent(est.id),
    });

    let marker = L.marker([est.geopoint.coordinates[1], est.geopoint.coordinates[0]], {
      icon: myIcon,
    })
      .bindPopup(
        `
        <b>ID: ${est.INFOUSAID} </b></br>
        <b>Company : ${est.CONAME}</b><br>
        County : ${est.COUNTY}, ${est.PRMSTATE}<br>
        Actual_Emp_Size : ${est.ALEMPSZ ? est.ALEMPSZ.toLocaleString() : ''}<br>
        NAICS_Code :  ${est.NAICSCD}<br>
        NAICS_Desc : ${est.NAICSDS}<br>
        INDFIRM_Code : ${est.INDIVIDUAL_FIRM_CODE}<br>
        INDFIRM_Desc : ${est.INDIVIDUAL_FIRM_DESC}<br>
        Match_Code: ${est.MATCHCD}<br>
        Date_of_SIC : ${est.YEAR_SIC_ADDED}<br>
        Big_Business : ${est.BIG_BUSINESS}<br>
        High_Tech : ${est.HIGHTECHBUSINESS}<br>
        <a href="javascript:void(0)" onclick="openEditModal(${est.id})">more info...</a>
      `
      )
      .openPopup();

    return marker;
  }
})();

// Open modal for the bubble popup
function openEditModal(id) {
  let query_version = d3.select('#version-dropdown').property('value');
  loadEditModal(id, query_version);
  $('#editModal').modal('show');
}
