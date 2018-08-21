function mapEstablishments(establishments) {
	// ---
	// remove all previous markers from map
	// ---

	while (markers.length > 0) {
		mymap.removeLayer(markers.pop())
	}


	var lats = [];
	var lngs = [];

	// if(establishments.data.geopoly){
	// 	//add polygon to map for county
	// 	console.log("YESSS")
	// }

	// --
	// employee scale
	// 1 - 1000 employees
	// mapped to 5 - 30 pixel width
	// --
	var employmentScale = d3.scaleLinear().domain([1, 999]).range([5, 15]);

	establishments = establishments.data.map(est => {
		est.geopoint = JSON.parse(est.geopoint);

		// get two digit code
		var twoDigitCode = null;
		if (est.NAICSCD) {
			twoDigitCode = est.NAICSCD.toString().slice(0, 2);
		}

		// get markerRadius
		var circleRadius = est.ALEMPSZ ? employmentScale(+est.ALEMPSZ) : 5;
		circleRadius = circleRadius.toFixed(2);

		// get color by NAICS industry
		let color = naicsKeys[twoDigitCode] ?
			naicsKeys[twoDigitCode].color :
			'black'

		// -- 
		// Create divIcon
		// http://leafletjs.com/reference-1.3.0.html#divicon
		// -- 
		var myIcon = L.divIcon({
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
			id: encodeURIComponent(est.CONAME)
		});
		// check if coordinate exist
		if (est.geopoint.coordinates[1] && est.geopoint.coordinates[0]) {
			// add to array for bounding box
			lats.push(est.geopoint.coordinates[1])
			lngs.push(est.geopoint.coordinates[0])

			// create marker
			marker = L.marker(
				[
					est.geopoint.coordinates[1],
					est.geopoint.coordinates[0]
				], {
					icon: myIcon,
				}
			)
			// create Pop Up
			marker.bindPopup(
				`
				<b>Company : ${est.CONAME}</b><br>
		    	Employees : ${est.ALEMPSZ ? est.ALEMPSZ.toLocaleString() : ''}<br>
		    	Payroll : ${est.BE_Payroll_Expense_Description}<br>
		    	NAICS :  ${est.NAICSCD}<br>
		    	Industry : ${est.NAICSDS}
		    	`
			).openPopup();

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

			marker.addTo(mymap);
			markers.push(marker)
		}
	});
	// mymap.setZoom(15);
	// calculate the bounding Box
	bbox = [
		[d3.min(lats), d3.min(lngs)],
		[d3.max(lats), d3.max(lngs)]
	]

	// zoom to bounds
	//values for paddingBottomRight are weird.... need further research
	//[1000,400]
	// mymap.fitBounds(bbox, {
	// 	paddingBottomRight: [1000, 400]
	// });

	// bbox = L.featureGroup(markers);
	// mymap.fitBounds(bbox.getBounds());
	mymap.fitBounds(bbox);
}

//TODO: SEPARATE TO PIE CHART FILE.JS
function loadPieChart(establishments) {

	//console.log(establishments);
	var industries = {};
	var ct = 0;

	$.each(establishments, function (key, value) {

		$.each(value, function (key2, value2) {

			$.each(value2, function (key3, value3) {
				if (key3 == "NAICSDS") {
					if (!industries.hasOwnProperty(value3)) {
						industries[value3] = 1;
					} else {
						industries[value3]++;
					}
					//console.log(value3);
				}
			});

		});

	});

	//var color  = d3.scaleLinear().domain([10, 60]).range([d3.rgb("#2383c1"), d3.rgb("#cc0f0f")]);
	//console.log(color(1));
	var pie_content = [];
	$.each(industries, function (key, value2) {
		if (value2 > 40) {
			ct++;
			item = {};
			item["label"] = key;
			item["value"] = value2;
			pie_content.push(item);
		}
	});
	if (ct < 10) {
		$.each(industries, function (key, value2) {
			if (value2 > 10) { //idea needs to be imroved
				ct++;
				item = {};
				item["label"] = key;
				item["value"] = value2;
				pie_content.push(item);
			}
		});
	}
	//console.log(ct);
	var wh = $(window).height();
	pie_h = (wh >= 670 && wh < 800) ? 260 : 380;
	pie_w = (wh >= 670 && wh < 800) ? 560 : 750;

	var pie_c = new d3pie("pieChart", {
		"header": {
			"title": {
				"fontSize": 24,
				"font": "open sans"
			},
			"subtitle": {
				"color": "#999999",
				"fontSize": 12,
				"font": "open sans"
			},
			"titleSubtitlePadding": 9
		},
		"footer": {
			"color": "#999999",
			"fontSize": 10,
			"font": "open sans",
			"location": "bottom-left"
		},
		"size": {
			"canvasHeight": pie_h, //380
			"canvasWidth": pie_w, //750 
			"pieOuterRadius": "70%"
		},
		"data": {
			"sortOrder": "value-desc",
			"content": pie_content
		},
		"labels": {
			"outer": {
				"pieDistance": 32
			},
			"inner": {
				"format": "none",
				"hideWhenLessThanPercentage": 3
			},
			"mainLabel": {
				"fontSize": 11
			},
			"percentage": {
				"color": "#ffffff",
				"decimalPlaces": 0
			},
			"value": {
				"color": "#adadad",
				"fontSize": 11
			},
			"lines": {
				"enabled": true
			},
			"truncation": {
				"enabled": true
			}
		},
		"tooltips": {
			"enabled": true,
			"type": "placeholder",
			"string": "{label}: {value}, {percentage}%"
		},
		"effects": {
			"pullOutSegmentOnClick": {
				"effect": "linear",
				"speed": 400,
				"size": 8
			}
		},
		"misc": {
			"gradient": {
				"enabled": true,
				"percentage": 100
			}
		},
		"callbacks": {
			// onClickSegment: function(a) {
			// 	alert("Segment clicked!");
			// 	console.log(a);
			//}
		}
	});
}