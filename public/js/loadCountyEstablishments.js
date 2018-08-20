//Takes an offset and limit to load the county with pagination.
function loadCountyEstablishments(county, offset, limit) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	d3.json(`/api/bycounty/${county}?offset=${offset}&limit=${limit}`)
		.then(data => {
			mapEstablishments(data);
			loadPieChart(data);
			loadDatatable(data);
		},function(err){
			alert("Query Error");
			console.log(err);
		});
}