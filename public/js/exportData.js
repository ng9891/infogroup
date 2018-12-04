/*
* Async functions used for the exporting features of the website.
*
* It does a Promise.all call to functions in 'convertDomToImage.js'
* then it creates a PDF file containing those images using jsPDF.
* Also, exports separately the datatable into a csv file then, both pdf and csv file are zipped using jsZip.
*
* Columns exported: [0, 1, 2, 3, 4, 5, 6] (everything on the datatable)
*
* Dependencies: jszip.js, datatable.js, jsPDF.js, jquery, convertDomToImage.js
*
* Expected input: A working datatable, piechart and histogram.
*
* Output: Prompts the user to download the zip file.
*/
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

	// Close infoContainer for printing
	$(".infoContainer").toggleClass("closed").promise().done(async () => {
		//Functions in convertDomToImage.js
		const [piechart, histogram, map] =
		await Promise.all([
			convertDomToImageAsync('pieChart').catch(async (e) => {
				doc.text(0, 40, "Error exporting the Pie Chart");
				return;
			}),
			convertDomToImageAsync('histogram-container').catch(async (e) => {
				doc.text(0, 400, "Error exporting the Histogram");
				return;
			}),
			convertDomToImageAsync('mapid').catch(async (e) => {

				// Try another way.
				return await convertDomToImage_html2canvasAsync('mapid').catch(async (e) => {
					console.log(e);
					doc.text(0, 750, "Error exporting the Map. \nTry zooming out of the map before exporting");
					return;
				});
			})
		]);

		if (piechart) doc.addImage(piechart.imgUrl, 'PNG', 0, 40);
		if (histogram) doc.addImage(histogram.imgUrl, 'PNG', 0, 400, histogram.width * 0.5, histogram.height * 0.5), 'hist', 'NONE', 300;
		if (map) {
			doc.addPage('a4', 'l');
			doc.addImage(map.imgUrl, 'PNG', 0, 70, map.width * 0.5, map.height * 0.5);
		}
		zipFiles(csvString, doc);
		// Open infoContainer once done printing
		$(".infoContainer").toggleClass("closed");
	});
}

function zipFiles(CSV_String, jsPDF_file) {
	if (!CSV_String) return;
	if (!jsPDF_file) return;
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