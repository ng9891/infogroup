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

	// Generate PDF
	var doc = new jsPDF('p', 'pt', 'a4');
	doc.setFontType("normal");
	doc.setFontSize("15");

	var title = $('#search-description').text();
	title = doc.splitTextToSize(title, 550); //Split long text
	doc.text(10, 25, title);
	convertMapToImage('pieChart', (imgURL, width, height) => {
		if(imgURL) doc.addImage(imgURL, 'PNG', 0, 40);
		else doc.text(0, 40, "Error exporting the Pie Chart");
		convertMapToImage('histogram-container', (imgURL, width, height) => {
			if(imgURL) doc.addImage(imgURL, 'PNG', 0, 400, width * 0.5, height * 0.5), 'hist', 'NONE', 300;
			else doc.text(0, 400, "Error exporting the Histogram");
			convertMapToImage('mapid', (imgURL, width, height) => {
				if(imgURL) {
					//Add extra page in ledger format
					doc.addPage('a4', 'l');
					doc.addImage(imgURL, 'PNG', 0, 70, width * 0.5, height * 0.5);
					zipFiles(csvString, doc);
				}
				else{
					// console.log('in error');
					// doc.text(0, 750, "Error exporting the Map. \nTry zooming out of the map before exporting");
					// doc.addPage('a4', 'l');
					$(".advancedSearchContainer").toggleClass("close");
					// Try another way.
					convertMapToImage_html2canvas('mapid', (imgURL, width, height) => {
						doc.addImage(imgURL, 'PNG', 0, 70, width * 0.5, height * 0.5);
						zipFiles(csvString, doc);
					});
					
				} 
			});
		});
	});
}
async function exportDataAsync() {
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

	// Generate PDF
	var doc = new jsPDF('p', 'pt', 'a4');
	doc.setFontType("normal");
	doc.setFontSize("15");

	var title = $('#search-description').text();
	title = doc.splitTextToSize(title, 550); //Split long text
	doc.text(10, 25, title);

	const [piechart, histogram, map] = 
		await Promise.all([
			convertDomToImageAsync('pieChart').catch(async (e)=>{
				doc.text(0, 40, "Error exporting the Pie Chart");
				return;
			}),
			convertDomToImageAsync('histogram-container').catch(async (e)=>{
				doc.text(0, 400, "Error exporting the Histogram");
				return;
			}),
			convertDomToImageAsync('mapid').catch(async (e)=>{
				$(".infoContainer").toggleClass("closed");
				// Try another way.
				return await convertDomToImage_html2canvasAsync('mapid').catch(async (e)=>{
					console.log(e);
					doc.text(0, 750, "Error exporting the Map. \nTry zooming out of the map before exporting");
					return;
				});
			})
		]);

	if(piechart) doc.addImage(piechart.imgUrl, 'PNG', 0, 40);
	if(histogram) doc.addImage(histogram.imgUrl, 'PNG', 0, 400, histogram.width * 0.5, histogram.height * 0.5), 'hist', 'NONE', 300;
	if(map){
		doc.addPage('a4', 'l');
		doc.addImage(map.imgUrl, 'PNG', 0, 70, map.width * 0.5, map.height * 0.5);
	}
	zipFiles(csvString, doc);

}

function zipFiles(CSV_String, jsPDF_file){
	if(!CSV_String) return;
	if(!jsPDF_file) return;
	var zip = new JSZip();
	zip.file("graphs.pdf", jsPDF_file.output(), {
		binary: true
	});
	zip.file("datatable.csv", CSV_String);
	zip.generateAsync({
			type: "blob"
		})
		.then(function (content) {
			//FileSaver.js
			saveAs(content, "infogroup.zip");
		});
}
