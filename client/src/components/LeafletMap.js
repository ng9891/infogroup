import React, { Component } from 'react';
import L from 'leaflet'
import { scaleLinear} from 'd3-scale'
import { min, max} from 'd3-array'
import { naicsKeys } from './naicsKeys'
import './Leaflet.css'

var mymap = null;
let markers = []

class LeafletMap extends Component {

  mapEstablishments (establishments) {
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
		var employmentScale = scaleLinear()             
	        .domain([1, 999])
	        .range([5, 30]);

		establishments = establishments.data.map(est =>{
		    est.geopoint = JSON.parse(est.geopoint)
		    
		    // get two digit coede
	        var twoDigitCode = est.NAICSCD.toString().slice(0,2);
	        // get markerRadius
	        var circleRadius = est.ALEMPSZ 
	        	? employmentScale(+est.ALEMPSZ) : 5
	        circleRadius = circleRadius.toFixed(2)
		   
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
			    let marker = L.marker(
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
			    
			    marker.addTo(mymap);
			    markers.push(marker)
		    }
		})

		// calculate the bounding Box

		let bbox = [
			[min(lats),min(lngs)],
			[max(lats),max(lngs)]
		]
		// zoom to bounds
		mymap.fitBounds(bbox);

	}
  
	componentWillReceiveProps(nextProps) {
		this.mapEstablishments(nextProps.data)
	}

	componentDidMount () {

	  mymap = L.map('mapContainer').setView([40.755, -74.00], 13);
		var markers = []
		console.log('mymap',mymap, L)
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(mymap);
	 }

  render() {
    return (
      <div id='mapContainer' style={{width:'100%', height: '100%', backgroundColor:'#efefef'}}>
      	I am a leaflet map.
      </div>
    );
  }
}

export default LeafletMap
