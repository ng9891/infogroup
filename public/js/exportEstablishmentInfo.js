function exportEstablishmentInfo() {
    // Generate PDF
    var doc = new jsPDF('p', 'pt', 'a4');
    doc.setFontType("normal");
    doc.setFontSize("15");

    var title = $('#search-description').text();
    title = doc.splitTextToSize(title, 800); //Split long text
    doc.text(10, 25, title);

    //TODO: Make this more readable
    //PIECHART IMAGE
    var piechart_svg_element = document.getElementById('pieChart');
    domtoimage.toPng(piechart_svg_element)
        .then(function (dataURL) {
            doc.addImage(dataURL, 'PNG', 0, 40);

            //HISTOGRAM IMAGE
            var histogram_svg_element = document.getElementById('histogram-container');
            domtoimage.toPng(histogram_svg_element)
                .then(function (dataUrl) {
                    let histogram_img = new Image();
                    histogram_img.src = dataUrl;
                    histogram_img.onload = function () { //Get image width and height and scale it to fit the PDF
                        doc.addImage(dataUrl, 'PNG', 0, 400, histogram_img.width * 0.5, histogram_img.height * 0.5), 'hist', 'NONE', 300;

                        //Add extra page in ledger format
                        doc.addPage('a4', 'l');
                        //MAP IMAGE
                        let map_element = document.getElementById("mapid");
                        domtoimage.toPng(map_element)
                            .then(function (dataUrl) {
                                let map_img = new Image();
                                map_img.src = dataUrl;
                                map_img.onload = function () { //Get image width and height and scale it to fit the PDF
                                    doc.addImage(dataUrl, 'PNG', 0, 100, map_img.width * 0.5, map_img.height * 0.5);
                                    doc.save('infogroup.pdf');
                                };
                            })
                            .catch(function (error) {
                                console.error('Error on printing map', error);
                            });
                    };
                })
                .catch(function (error) {
                    console.error('Error on printing histogram', error);
                });
        })
        .catch(function (error) {
            console.error('Error on printing PieChart', error);
        });
}