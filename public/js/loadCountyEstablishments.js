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

	//---
	//Maybe add county polygon request here.
	//---

	d3.json(reqURL)
		.then(data => {
			mapEstablishments(data);
			loadPieChart(data);
			loadDatatable(data);
			d3.select('#countyInput').property("value", county);
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}