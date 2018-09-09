function loadAdvancedSearchEstablishments(industry, employee, borough) {
	// --
	// load data from api
	// then add to map
	// --
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	// Creates a request URL for the API
	var reqURL = '/api/advancedSearch';
	if (industry) {
		reqURL += '?industry=' + industry;
		if (employee) {
			reqURL += '&employee=' + employee;
			if (borough) {
			reqURL += '&borough=' + borough;
			}
		}
	}
	// console.log(reqURL);
	
	d3.json(reqURL)
		.then(data => {
			if (data.data.length == 0) {
				$("#search-message").show().delay(2000).fadeOut();
				$('#jq_datatable_search').DataTable().clear().draw();
			} 
			else {
				mapEstablishments(data);
				loadDatatableAdvancedSearch(data);
				loadHistogram(data);
			}
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}