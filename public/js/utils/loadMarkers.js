/*
* Function will create a marker in mymap for any points inside the parameter 'establishments'
* Previous markers and overlay layers will be cleared.
* The color of the markers will be decided by their repective NAICS code.
* Dependencies:	- naicsKeys.js that contains a look up color scheme depending on NAICS code.
*				- variable 'layerControl' of type L.control.layers
*       - variable 'mymap'
*       - variable 'querylayer' from Drawing Queries.
*       - variable 'markerList'
*       - variable 'markers' from ClusterPlugin
* Expected input: an object with an array of JSON object called 'data'
* Output: Markers will be added into mymap and markerList array 
*/
function loadMarkers(establishments) {
  return new Promise((resolve) => {
    // ---
    // remove all previous markers from map
    // ---

    // while (markers.length > 0) {
    // 	mymap.removeLayer(markers.pop());
    // }

    let lats = [];
    let lngs = [];

    // if(establishments.data.geopoly){
    // 	//add polygon to map for county
    // 	console.log("YESSS")
    // }

    // --
    // employee scale
    // 1 - 1000 employees
    // mapped to 5 - 30 pixel width
    // --
    let employmentScale = d3.scaleLinear().domain([1, 999]).range([7, 15]);

    establishments = establishments.data.map((est) => {
      est.geopoint = JSON.parse(est.geopoint);

      // get two digit code
      let twoDigitCode = null;
      if (est.NAICSCD) {
        twoDigitCode = est.NAICSCD.toString().slice(0, 2);
      }

      // get markerRadius
      let circleRadius = est.ALEMPSZ ? employmentScale(+est.ALEMPSZ) : 7;
      circleRadius = circleRadius.toFixed(2);

      // get color by NAICS industry
      let color = naicsKeys[twoDigitCode] ? naicsKeys[twoDigitCode].color : 'black';

      // --
      // Create divIcon
      // http://leafletjs.com/reference-1.3.0.html#divicon
      // --
      let myIcon = L.divIcon({
        className: 'current-location-icon',
        html: `
				<div id="${encodeURIComponent(est.CONAME)}" 
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
        id: encodeURIComponent(est.CONAME),
      });
      // check if coordinate exist
      if (est.geopoint.coordinates[1] && est.geopoint.coordinates[0]) {
        // add to array for bounding box
        lats.push(est.geopoint.coordinates[1]);
        lngs.push(est.geopoint.coordinates[0]);

        // create marker
        let marker = L.marker([est.geopoint.coordinates[1], est.geopoint.coordinates[0]], {
          icon: myIcon,
        });

        // create Pop Up
        marker
          .bindPopup(
            `
              <b>ID: ${est.id} </b></br>
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

        /*
			marker.on('click', function(){
				//Does it also accepts ReactJs innerHTML? Needs to check.
				$("div.Object-desc").empty();
				$("div.Object-desc").html(
					`
					<b>Company : ${est.CONAME}</b><br>
					Employees : ${est.ALEMPSZ ? est.ALEMPSZ.toLocaleString() : ''}<br>
					Payroll : ${est.BE_Payroll_Expense_Description}<br>
					NAICS :  ${est.NAICSCD}<br>
					Industry : ${est.NAICSDS}
					`
				);
			});
			*/

        markerList.push(marker);
        // markers.addLayer(marker);
        // mymap.addLayer(markers);
        // marker.addTo(mymap);
        // mymap.addLayer(markerList);
      }
    });
    markers.addLayers(markerList);
    mymap.addLayer(markers);
    layerControl.addOverlay(markers, 'Establishments');

    // mymap.setZoom(15);
    // calculate the bounding Box
    bbox = [[d3.min(lats), d3.min(lngs)], [d3.max(lats), d3.max(lngs)]];

    // zoom to bounds
    //values for paddingBottomRight are weird.... need further research
    //[1000,400]
    // mymap.fitBounds(bbox, {
    // 	paddingBottomRight: [1000, 400]
    // });

    mymap.fitBounds(bbox);
    resolve('Map Loaded');
  });
}


function openEditModal(id){
  let query_version = d3.select('#version-dropdown').property('value');
  loadEditModal(id, query_version);
  $('#editModal').modal('show');
}