function loadAdvancedSearchEstablishments(industry, minempl, maxempl, salvol, county_name, mpo_name, mun_name, mun_type, mun_county) {

	$("div.Object-desc").empty();
	$("#pieChart").empty();
	if (usrMarkers.length !== 0) mymap.removeLayer(usrMarkers.pop()); //removes marker from user

	var searchType = "Search:";
	var searchValue = "";

	industry = ($.trim(industry) !== '') ? industry : 'null';
	minempl = ($.trim(minempl) !== '') ? minempl : 0;
	maxempl = ($.trim(maxempl) !== '') ? maxempl : 'null';
	salvol = ($.trim(salvol) !== '') ? salvol : 'null';
	county_name = ($.trim(county_name) !== '') ? county_name : 'null';
	mpo_name = ($.trim(mpo_name) !== '') ? mpo_name : 'null';
	mun_name = ($.trim(mun_name) !== '') ? mun_name : 'null';
	mun_type = ($.trim(mun_type) !== '') ? mun_type : 'null';
	mun_county = ($.trim(mun_county) !== '') ? mun_county : 'null';


	var reqURL = '/api/advancedSearch?';
	var params = {
		'industry': industry,
		'minempl': minempl,
		'maxempl': maxempl,
		'salvol': salvol,
		'county_name': county_name,
		'mpo_name': mpo_name,
		'mun_name': mun_name,
		'mun_type': mun_type,
		'mun_county': mun_county
	};

	var query = $.param(params);
	reqURL += query;

	//Search criteria for display
	let firstRow = {
		'MPO': mpo_name,
		'County': county_name,
		'Mun': mun_name,
		'Mun Type': mun_type,
		'Mun County': mun_county,

	}
	let secondRow = {
		'Industry': industry,
		'EmpMin': minempl,
		'EmpMax': maxempl
	}
	let arr_obj = [firstRow, secondRow];
	searchValue = buildSearchValString(arr_obj);

	//console.log(reqURL);

	d3.json(reqURL)
		.then(data => {
			if (data.data.length == 0) {
				$(".advancedSearchContainer").toggleClass("open");
				$("#search-message").show().delay(5000).fadeOut();
				clearDatatable(); //loadDatatable.js

				searchValue[0] = 'NOT FOUND.' + searchValue[0];
				updateSearchInfo('Search:', searchValue);
			} else {
				//TODO: check for max data length and alert user
				mapEstablishments(data);
				loadPieChart(data);
				loadHistogram(data);
				loadDatatable(data);
				updateSearchInfo(searchType, searchValue);

				if (mun_name != 'null') {
					//Get Query layer/ bounding box
					d3.json('/api/getmun/' + mun_name)
						.then(data => {
							loadQueryOverlay(data);
						}, function (err) {
							alert("Query Error on Base Layer");
							console.log(err);
						});
				} else if (county_name != 'null') {
					//Get Query layer/ bounding box
					console.log('COUNTY OVERLAY CALLED ' + county_name)
					d3.json('/api/getcounty/' + county_name)
						.then(data => {
							console.log(data);
							loadQueryOverlay(data);
						}, function (err) {
							alert("Query Error on Base Layer");
							console.log(err);
						});
				} else if (mpo_name != 'null') {
					//Get Query layer/ bounding box
					d3.json('/api/getmpo/' + mpo_name)
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

function buildSearchValString(arr_obj) {
	let arr_str = [];
	arr_obj.map(obj => {
		let key_arr = Object.keys(obj);
		let string = '';
		let filtered_key_arr = key_arr.filter(k => {
			return obj[k] != 'null' && obj[k] != 0;
		});

		filtered_key_arr.map((k, i) => {
			string += ` ${k}: ${obj[k]}`;
			if (i < filtered_key_arr.length - 1) string += ',';
		});
		arr_str.push(string);
	});

	return arr_str;
}