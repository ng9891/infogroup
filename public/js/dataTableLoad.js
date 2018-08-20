
//Creates a Datatable with the information in data
function loadTables(data){

	// render the table(s)
	var table = $('#table_id').DataTable({
		data: data,
		paging: false,
		scrollY: 300,
		columns: [
			{ title: "CONAME", data: 'CONAME'},
			{ title: "NAICSCD", data: 'NAICSCD'}
		],
		destroy: true
	});

	//TODO: ADD MORE TABLES
}