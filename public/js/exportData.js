function exportData() {
	// Convert datatable export into CSV string
	let columnsToExport = [0, 1, 2, 3, 4, 5, 6];

	let table = $('#jq_datatable').DataTable();
	let data = table.buttons.exportData({
		modifier: {
			search: 'none'
		},
		columns: columnsToExport
	});
	let csvArray = [];
	data.body.forEach(function (entry) {
		let line = entry.join(",");
		csvArray.push(line);
	});
	var csvString = csvArray.join("\n");
	// console.log(csvContent);

	// Generate PDF
	var doc = new jsPDF('p', 'pt', 'a4');
	doc.setFontType("normal");
	doc.setFontSize("15");

	var title = $('#search-description').text();
	title = doc.splitTextToSize(title, 550); //Split long text
	doc.text(10, 25, title);
	convertDomToImage('pieChart', (imgURI, width, height) => {
		if(imgURI) doc.addImage(imgURI, 'PNG', 0, 40);
		else doc.text(0, 40, "Error exporting the Pie Chart");
		convertDomToImage('histogram-container', (imgURI, width, height) => {
			if(imgURI) doc.addImage(imgURI, 'PNG', 0, 400, width * 0.5, height * 0.5), 'hist', 'NONE', 300;
			else doc.text(0, 400, "Error exporting the Histogram");
			convertDomToImage('mapid', (imgURI, width, height) => {
				//Add extra page in ledger format
				if(imgURI) {
					doc.addPage('a4', 'l');
					doc.addImage(imgURI, 'PNG', 0, 70, width * 0.5, height * 0.5);
				}
				else{
					doc.text(0, 750, "Error exporting the Map. \nTry zooming out of the map before exporting");
				} 

				var zip = new JSZip();
				zip.file("graphs.pdf", doc.output(), {
					binary: true
				});
				zip.file("datatable.csv", csvString);
				zip.generateAsync({
						type: "blob"
					})
					.then(function (content) {
						//FileSaver.js
						saveAs(content, "infogroup.zip");
					});
			});
		});
	});
}


	// generatePDF((doc) => {
	// 	if (!doc) {
	// 		alert("There was an error on exporting");
	// 		return;
	// 	}
	// 	var zip = new JSZip();
	// 	zip.file("graphs.pdf", doc.output(), {
	// 		binary: true
	// 	});
	// 	zip.file("datatable.csv", csvString);
	// 	zip.generateAsync({
	// 			type: "blob"
	// 		})
	// 		.then(function (content) {
	// 			//FileSaver.js
	// 			saveAs(content, "infogroup.zip");
	// 		});
	// 	// doc.save('infogroup.pdf');	//PDF
	// 	// $.fn.dataTable.ext.buttons.csvHtml5.action.call(this, e, dt, button, config);	//Datatable as csv
	// });
