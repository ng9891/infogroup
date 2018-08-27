
//Creates a Datatable with the information in data
function loadDatatable(establishments) {

	var calcDataTableHeight = function() {
		var wh = $(window).height();
		if (wh >= 670 && wh < 800)
			return  wh * 0.2;
		else
			return wh * 0.32
	};

	var obj = {
		data: []
	};
	
	establishments = establishments.data.map(est =>{
		obj.data.push({
			name: est.CONAME,
			employee: est.ALEMPSZ,
			industry: est.NAICSDS,
			prmsic: est.PRMSICDS,
			sales_volume: est.LSALVOLDS,
			square_foot: est.SQFOOTCD
		});
	});

	$(document).ready(function() {
		$('#jq_datatable').DataTable({
			"data" : obj.data,
			"columns" : [
				{ "data": "name" },
				{ "data": "employee" },
				{ "data": "industry" },
				{ "data": "prmsic" },
				{ "data": "sales_volume" },
				{ "data": "square_foot" }
			],
			"columnDefs" : [
				{"width": 34, "targets": 1},
				{"width": 34, "targets": 5}
			],
			"fixedColumns" : true,
			"bLengthChange" : false,
			"scrollY":        calcDataTableHeight(),
			"scrollCollapse": true,
			"pageResize": true,
			"destroy": true
		});
	} );
}