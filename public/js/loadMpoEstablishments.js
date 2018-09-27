//Takes an offset and limit to load the county with pagination.
//Limit is usually undefined and set to default value unless specified by api.
function loadMpoEstablishments(mpo, offset, limit) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();
	// if (usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user

	// Creates a request URL for the API
	var reqURL = '/api/bympo/' + mpo;
	if (offset) {
		reqURL += '?offset=' + offset;
		if (limit) {
			reqURL += '&limiter=' + limit;
		}
	}
	// console.log(reqURL);

	d3.json(reqURL)
		.then(data => {
			if (data.data.length === 0) {
				console.log("Query not found.");
				updateSearchInfo('NOT FOUND', mpo.toUpperCase());
			} else {
				mapEstablishments(data);
				loadPieChart(data);
				loadDatatable(data);
				loadHistogram(data);

				//Get Query layer/ bounding box
				d3.json('/api/getmpo/' + mpo)
					.then(data => {
						loadQueryOverlay(data);
						let mpo_name = data.data[0].name;
                        updateSearchInfo('MPO', mpo_name);
					}, function (err) {
						alert("Query Error on Base Layer");
						console.log(err);
					});
			}
		}, function (err) {
			alert("Query Error on mpo Establishment");
			console.log(err);
		});
}