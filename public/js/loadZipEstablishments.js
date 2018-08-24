function loadZipEstablishments(zip) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();
	if(usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user

	d3.json(`/api/byzip/${zip}`)
		.then(data => {
			mapEstablishments(data);
			loadPieChart(data);
			loadDatatable(data);
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}