function loadAdvancedSearchEstablishments(industry, minempl, maxempl, salvol, borough) {
	
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	industry = ($.trim(industry)!=='') ? industry : 'null';
	minempl = ($.trim(minempl)!=='') ? minempl : 0;
	maxempl = ($.trim(maxempl)!=='') ? maxempl : 'null';
	salvol = ($.trim(salvol)!=='') ? salvol : 'null';
	borough = ($.trim(borough)!=='') ? borough : 'null';

	var reqURL = '/api/advancedSearch?';
	var params = {
		'industry': industry,
		'minempl': minempl,
		'maxempl': maxempl,
		'salvol': salvol,
		'borough': borough 
	};

	var query = $.param(params);
	reqURL += query;
	//console.log(reqURL);
	
	d3.json(reqURL)
		.then(data => {
			if (data.data.length == 0) {
				$(".advancedSearchContainer").toggleClass("open");
				$("#search-message").show().delay(5000).fadeOut();
				$('#jq_datatable_search').DataTable().clear().draw();
			} 
			else {
				//TODO: check for max data length and alert user
				mapEstablishments(data);
				loadPieChart(data);
				loadHistogram(data);
				loadDatatable(data);
			}
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}