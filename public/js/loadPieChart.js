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