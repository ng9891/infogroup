function loadAdvancedSearchEstablishments(industry, minempl, maxempl, salvol, borough) {
	
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	industry = ($.trim(industry)!=='') ? industry : 'null';
	minempl = ($.trim(minempl)!=='') ? minempl : 0;
	maxempl = ($.trim(maxempl)!=='') ? maxempl : 'null';
	salvol = ($.trim(salvol)!=='') ? salvol : 'null';
	borough = ($.trim(borough)!=='') ? borough : 'null';

	var searchType = "Search Results";
	var searchValue="";
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
				clearDatatable(); //loadDatatable.js
				updateSearchInfo('Search: NOT FOUND', searchValue);
			} 
			else {
				//TODO: check for max data length and alert user
				mapEstablishments(data);
				loadPieChart(data);
				loadHistogram(data);
				loadDatatable(data);
				updateSearchInfo(searchType, searchValue);
				
				if (borough) {
					//Get Query layer/ bounding box
					d3.json('/api/getcounty/' + borough)
					.then(data => {
						loadQueryOverlay(data);
					}, function (err) {
						alert("Query Error on Base Layer");
						console.log(err);
					});
				}
			
			}
		}, function (err) {
			alert("Query Error");
			console.log(err);
		});
}