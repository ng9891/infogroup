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
			if (data.data.length === 0) {
				console.log("Query not found.");
				updateSearchInfo('NOT FOUND', zip);
			} else {
				$("div.Object-desc").empty();
				$("#pieChart").empty();
				mapEstablishments(data);
				loadPieChart(data);
				loadDatatable(data);
				loadHistogram(data);
				updateSearchInfo('ZipCode', zip);

				//Get Query layer/ bounding box
				d3.json('/api/getzip/' + zip)
					.then(data => {
						loadQueryOverlay(data);
					}, function (err) {
						alert("Query Error on Base Layer");
						console.log(err);
					});
			}
		}, function (err) {
			console.log(err);
			alert("Query Error on Zip Establishment");
		});
}