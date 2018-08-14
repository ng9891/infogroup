
//Creates a Datatable with the information in est
function loadTables(data){
    //TODO: Check if exist if not clear
    
	// render the table(s)
	var table = $('#table_id').DataTable({
		data: data,
		paging: false,
		scrollY: 400,
		columns: [
			{ title: "CONAME", data: 'CONAME'},
			{ title: "NAICSCD", data: 'NAICSCD'}
		]
	});

	//TODO: ADD MORE TABLE
}