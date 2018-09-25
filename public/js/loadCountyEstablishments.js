//Takes an offset and limit to load the county with pagination.
//Limit is usually undefined and set to default value unless specified by api.
function loadCountyEstablishments(county, offset, limit) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();
	if(usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user

	// Creates a request URL for the API
	var reqURL = '/api/bycounty/' + county;
	if (offset) {
		reqURL += '?offset=' + offset;
		if (limit) {
			reqURL += '&limiter=' + limit;
		}
	}
	// console.log(reqURL);

	d3.json(reqURL)
		.then(data => {
			if (data.data.length === 0){
				console.log("Query not found.");
			}else{
				mapEstablishments(data);
				loadPieChart(data);
				loadDatatable(data);
				loadHistogram(data);
				updateSearchInfo('County', county.toUpperCase());
			}
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}