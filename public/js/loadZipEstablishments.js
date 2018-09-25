function loadZipEstablishments(zip) {
	// --
	// load data from api
	// then add to map
	// --
	
	if(usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user

	d3.json(`/api/byzip/${zip}`)
		.then(data => {
			$("div.Object-desc").empty();
			$("#pieChart").empty();
			mapEstablishments(data);
			loadPieChart(data);
			loadDatatable(data);
			loadHistogram(data);
			updateSearchInfo('ZipCode', zip);
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}