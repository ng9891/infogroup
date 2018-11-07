function convertDomToImage(containerID, callback) {
    let map_element = document.getElementById(containerID);
    domtoimage.toPng(map_element)
        .then(function (dataUrl) {
            let img = new Image();
            img.src = encodeURI(dataUrl);
            img.onload = function () { //Get image width and height and scale it to fit the PDF
                // doc.addImage(dataUrl3, 'PNG', 0, 70, img.width * 0.5, img.height * 0.5);
                callback(dataUrl, img.width, img.height);
            };
        })
        .catch(function (error) {
            console.error(`Error on printing ${containerID}`, error);
            callback();
        });
}

/*function generatePDF(callback) {
    // Generate PDF
    var doc = new jsPDF('p', 'pt', 'a4');
    doc.setFontType("normal");
    doc.setFontSize("15");

    var title = $('#search-description').text();
    title = doc.splitTextToSize(title, 550); //Split long text
    doc.text(10, 25, title);
    //PIECHART IMAGE
    var piechart_svg_element = document.getElementById('pieChart');
    domtoimage.toPng(piechart_svg_element)
        .then(function (dataURL) {
            doc.addImage(dataURL, 'PNG', 0, 40);

            //HISTOGRAM IMAGE
            var histogram_svg_element = document.getElementById('histogram-container');
            domtoimage.toPng(histogram_svg_element)
                .then(function (dataUrl2) {
                    let histogram_img = new Image();
                    histogram_img.src = dataUrl2;
                    histogram_img.onload = function () { //Get image width and height and scale it to fit the PDF
                        doc.addImage(dataUrl2, 'PNG', 0, 400, histogram_img.width * 0.5, histogram_img.height * 0.5), 'hist', 'NONE', 300;

                        //Add extra page in ledger format
                        doc.addPage('a4', 'l');
                        //MAP IMAGE
                        let map_element = document.getElementById("mapid");
                        domtoimage.toPng(map_element)
                            .then(function (dataUrl3) {
                                let map_img = new Image();
                                map_img.src = encodeURI(dataUrl3);
                                map_img.onload = function () { //Get image width and height and scale it to fit the PDF
                                    doc.addImage(dataUrl3, 'PNG', 0, 70, map_img.width * 0.5, map_img.height * 0.5);
                                    callback(doc);
                                };
                            })
                            .catch(function (error) {
                                console.error('Error on printing map', error);
                                callback();
                            });
                    };
                })
                .catch(function (error) {
                    console.error('Error on printing histogram', error);
                    callback();
                });
        })
        .catch(function (error) {
            console.error('Error on printing PieChart', error);
            callback();
        });
}*/