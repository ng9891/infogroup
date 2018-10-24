function loadAdvancedSearchEstablishments(industry, minempl, maxempl, salvol, county_name, mpo_name, mun_name, mun_type, mun_county) {
	
	$("div.Object-desc").empty();
	$("#pieChart").empty();

	var searchType = "Search:";
	var searchValue="";

	// industry 	= ($.trim(industry)!=='') ? (industry, searchValue+=` industry: ${industry}`) : 'null';
	// minempl		= ($.trim(minempl)!=='') ? (minempl, searchValue+=` minEmp: ${minempl}`) : 0;
	// maxempl 	= ($.trim(maxempl)!=='') ? (maxempl, searchValue+=` maxempl: ${maxempl}`) : 'null';
	// salvol 		= ($.trim(salvol)!=='') ? (salvol, searchValue+=` salvol: ${salvol}`)  : 'null';
	// county_name = ($.trim(county_name)!=='') ? (county_name, searchValue+= ` county: ${county_name}`) : 'null';
	// mpo_name 	= ($.trim(mpo_name)!=='') ? (mpo_name, searchValue+=` mpo: ${mpo_name}`) : 'null';
	// mun_name	= ($.trim(mun_name)!=='') ? (mun_name, searchValue+=` mun: ${mun_name}`) : 'null';
	// mun_type	= ($.trim(mun_type)!=='') ? (mun_type, searchValue+=` type: ${mun_type}`) : 'null';
	// mun_county	= ($.trim(mun_county)!=='') ? (mun_county, searchValue+=` mun_county: ${mun_county}`) : 'null';

	industry 	= ($.trim(industry)!=='') ? industry : 'null';
	minempl		= ($.trim(minempl)!=='') ? minempl : 0;
	maxempl 	= ($.trim(maxempl)!=='') ? maxempl : 'null';
	salvol 		= ($.trim(salvol)!=='') ? salvol : 'null';
	county_name = ($.trim(county_name)!=='') ? county_name : 'null';
	mpo_name 	= ($.trim(mpo_name)!=='') ? mpo_name : 'null';
	mun_name	= ($.trim(mun_name)!=='') ? mun_name : 'null';
	mun_type	= ($.trim(mun_type)!=='') ? mun_type : 'null';
	mun_county	= ($.trim(mun_county)!=='') ? mun_county : 'null';


	var reqURL = '/api/advancedSearch?';
	var params = {
		'industry'		: industry,
		'minempl'		: minempl,
		'maxempl'		: maxempl,
		'salvol'		: salvol,
		'county_name'	: county_name,
		'mpo_name'		: mpo_name,
		'mun_name'		: mun_name,
		'mun_type'		: mun_type,
		'mun_county'	: mun_county 
	};

	var query = $.param(params);
	reqURL += query;

	searchValue = buildSearchValString(params);

	//console.log(reqURL);
	
	d3.json(reqURL)
		.then(data => {
			if (data.data.length == 0) {
				$(".advancedSearchContainer").toggleClass("open");
				$("#search-message").show().delay(5000).fadeOut();
				clearDatatable(); //loadDatatable.js
				updateSearchInfo('Search: NOT FOUND.', searchValue);
			} 
			else {
				//TODO: check for max data length and alert user
				mapEstablishments(data);
				loadPieChart(data);
				loadHistogram(data);
				loadDatatable(data);
				updateSearchInfo(searchType, searchValue);
				
				if (county_name) {
					//Get Query layer/ bounding box
					d3.json('/api/getcounty/' + county_name)
					.then(data => {
						loadQueryOverlay(data);
					}, function (err) {
						alert("Query Error on Base Layer");
						console.log(err);
					});
				}

				if (mpo_name) {
					//Get Query layer/ bounding box
					d3.json('/api/getmpo/' + mpo_name)
					.then(data => {
						loadQueryOverlay(data);
					}, function (err) {
						alert("Query Error on Base Layer");
						console.log(err);
					});
				}

				if (mun_name) {
					//Get Query layer/ bounding box
					d3.json('/api/getmun/' + mun_name)
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

function buildSearchValString(obj){
	let key_arr = Object.keys(obj);
	let string = '';
    key_arr = key_arr.map((k,i) => {
		if(obj[k] != 'null' && obj[k]!= 0){
			string += ` ${k}:${obj[k]}\n`;
		}
	});
	return string;
}