
//Creates a Datatable with the information in data
function loadDatatable(establishments) {

	var wh = $(window).height();
	var calcDataTableHeight = (LessThan17inch) ? wh * 0.23 : wh * 0.32;

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
				{ title: "Name", data: "name" },
				{ title: "Emp", data: "employee" },
				{ title: "Industry", data: "industry" },
				{ title: "PR.SIC", data: "prmsic" },
				{ title: "Sales Vol.", data: "sales_volume" },
				{ title: "SQF", data: "square_foot" },
				{ title: "ED", data: null, defaultContent: "<button type='button' id='btn_edit' class='btn btn-primary btn-xs'>Edit</button>" }
			],
			"columnDefs" : [
				{"width": 34, "targets": 1},
				{"width": 34, "targets": 5},
				{"width": 34, "targets": 6}
			],
			"fixedColumns" : true,
			"bLengthChange" : false,
			"scrollY":        calcDataTableHeight,
			"scrollCollapse": true,
			"pageResize": true,
			"destroy": true
		});

		$('#jq_datatable tbody').on( 'click', 'button', function () {
			//TODO: call function for editing specific entry
        	$('.editEntity').show();
		} );

	} );
}

/*
function loadDatatableAdvancedSearch(establishments) {
	
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
		$('#jq_datatable_search').DataTable({
			"data" : obj.data,
			"columns" : [
				{ title: "Name", data: "name" },
				{ title: "Emp", data: "employee" },
				{ title: "Industry", data: "industry" },
				{ title: "PR.SIC", data: "prmsic" },
				{ title: "Sales Vol.", data: "sales_volume" },
				{ title: "SQF", data: "square_foot" }
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
	});
}
*/