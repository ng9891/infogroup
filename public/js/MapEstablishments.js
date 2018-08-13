
function mapEstablishments (establishments) {
	// ---
	// remove all previous markers from map
    // ---
	while(markers.length > 0){
		mymap.removeLayer(markers.pop())
	}
	
	var lats = []; var lngs = [];
	// --
	// employee scale
	// 1 - 1000 employees
	// mapped to 5 - 30 pixel width
	// --
	var employmentScale = d3.scaleLinear().domain([1, 999]).range([5, 12]);

	establishments = establishments.data.map(est =>{
	    est.geopoint = JSON.parse(est.geopoint)
	    
	    // get two digit coede
        var twoDigitCode = est.NAICSCD.toString().slice(0,2);
        // get markerRadius
        var circleRadius = est.ALEMPSZ ? employmentScale(+est.ALEMPSZ) : 5;
        circleRadius = circleRadius.toFixed(2);
	   
	 	// get color by NAICS industry
	    let color = naicsKeys[twoDigitCode] 
	    	? naicsKeys[twoDigitCode].color 
	    	: 'black'
	    
	    // -- 
	    // Create divIcon
	    // http://leafletjs.com/reference-1.3.0.html#divicon
	    // -- 
	    var myIcon = L.divIcon({
	        className:'current-location-icon',
	        html:`
				<div id="${encodeURIComponent(est.CONAME)}" 
					class = "NAICS" 
	        		style="
	        			width:${circleRadius}px;
	        			height:${circleRadius}px;
	        			background-color:${color};
	        			border-radius:500px;"
	        	></div>`,
	        iconAnchor:[0,0],
	        iconSize:null,
	        popupAnchor:[0,0],
	        id: encodeURIComponent(est.CONAME)
	    });
	    // check if coordinate exist
	    if(est.geopoint.coordinates[1] && est.geopoint.coordinates[0]) {
		    // add to array for bounding box
		    lats.push(est.geopoint.coordinates[1])
		    lngs.push(est.geopoint.coordinates[0])
		
		    // create marker
		    marker = L.marker(
		    	[
		    		est.geopoint.coordinates[1], 
		    		est.geopoint.coordinates[0]
		    	], 
		    	{icon: myIcon}
		    )
		    // create Pop Up
		    marker.bindPopup(
		    	`<b>Company : ${est.CONAME}</b><br>
		    	 Employees : ${est.ALEMPSZ ? est.ALEMPSZ.toLocaleString() : ''}<br>
		    	 Payroll : ${est.BE_Payroll_Expense_Description}<br>
		    	 NAICS :  ${est.NAICSCD}<br>
		    	 Industry : ${est.NAICSDS}

		    	`
			).openPopup();

			marker.on('click', function(){
				//Does it also accepts ReactJs innerHTML? Needs to check.
				$("div.Object-desc").html(
					`<b>Company : ${est.CONAME}</b><br>
					Employees : ${est.ALEMPSZ ? est.ALEMPSZ.toLocaleString() : ''}<br>
					Payroll : ${est.BE_Payroll_Expense_Description}<br>
					NAICS :  ${est.NAICSCD}<br>
					Industry : ${est.NAICSDS}`
				);
			});
			
			
		    marker.addTo(mymap);
		    markers.push(marker)
	    }
	})

	// calculate the bounding Box

	bbox = [
		[d3.min(lats),d3.min(lngs)],
		[d3.max(lats),d3.max(lngs)]
	]
	// zoom to bounds
	mymap.fitBounds(bbox);

}

function loadEstablishments(zip) {
	// --
	// load data from api
	// then add to map
	// --
	d3.json(`/api/byzip/${zip}`)
		.then(data => {
			mapEstablishments(data)
		})
}
