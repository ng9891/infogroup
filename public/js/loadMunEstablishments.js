//Takes an offset and limit to load the county with pagination.
//Limit is usually undefined and set to default value unless specified by api.
function loadMunEstablishments(mun, mun_type, county, offset, limit) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();
	if (usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user

	// Creates a request URL for the API
	var reqURL = '/api/bymun/' + mun;
	let param = '';
	if(mun_type && county){
		param += '?mun_type=' + mun_type + '&county=' + county;
		reqURL += param;
	}else{
		param += '?exact=1'
	}
	if (offset) {
		reqURL += '&offset=' + offset;
		if (limit) {
			reqURL += '&limiter=' + limit;
		}
	}
	// console.log(reqURL);

	d3.json(reqURL)
		.then(data => {
			if (data.data.length === 0) {
				console.log("Query not found.");
				updateSearchInfo('NOT FOUND', mun.toUpperCase());
			} else {
				mapEstablishments(data);
				loadPieChart(data);
                loadDatatable(data);
                // TODO: NEED FIX HISTOGRAM
				// loadHistogram(data);
				if(mun_type) updateSearchInfo(mun_type, mun.toUpperCase());
				else updateSearchInfo('Municipal', mun.toUpperCase());

				//Get Query layer/ bounding box
				d3.json('/api/getmun/' + mun + param)
					.then(data => {
						loadQueryOverlay(data);
					}, function (err) {
						alert("Query Error on Base Layer");
						console.log(err);
					});
			}
		}, function (err) {
			alert("Query Error on Mun Establishment");
			console.log(err);
		});
}