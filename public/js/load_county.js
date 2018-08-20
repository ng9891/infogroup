
function loadCountyEstablishments(county) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	d3.json(`/api/bycounty/${county}`)
		.then(data => {
			mapEstablishments(data);
			loadPieChart(data);
			loadDatatable(data);
		});
}