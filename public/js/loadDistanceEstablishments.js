// distance is in meters.
function loadDistanceEstablishments(lon, lat, dist) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	// Creates a request URL for the API
	var reqURL = '/api/bydistance';
	if (lon) {
		reqURL += '?lon=' + lon;
		if (lat) {
			reqURL += '&lat=' + lat;
			if (dist) {
				reqURL += '&dist=' + dist;
			}
		}
	}

	// console.log(reqURL);
	
	d3.json(reqURL)
		.then(data => {
			if (data.data.length === 0){
				updateSearchInfo('NOT FOUND');
			}else{
				mapEstablishments(data);
				loadPieChart(data);
				loadDatatable(data);
				loadHistogram(data);
				updateSearchInfo('Distance Query', dist);
			}
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}