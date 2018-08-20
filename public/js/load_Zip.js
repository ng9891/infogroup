function loadEstablishments(zip) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	d3.json(`/api/byzip/${zip}`)
		.then(data => {
			mapEstablishments(data);
			loadPieChart(data);
			loadDatatable(data);
		})
}