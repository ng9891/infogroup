//Takes an offset and limit to load the county with pagination.
//Limit is usually undefined and set to default value unless specified by api.
function loadCountyEstablishments(county, offset, limit) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	// Let server handle the empty values
	if(offset === undefined){
		offset = 0;
	}

	if(limit === undefined){
		limit = '';
	}


	//---
	//Maybe add county polygon request here.
	//---
			
	d3.json(`/api/bycounty/${county}?offset=${offset}&limiter=${limit}`)
		.then(data => {
			mapEstablishments(data);
			loadPieChart(data);
			loadDatatable(data);
			d3.select('#countyInput').property("value", county);
		},function(err){
			alert("Query Error");
			console.log(err);
		});
}