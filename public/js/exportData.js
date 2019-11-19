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

(() => {
  const sleep = (dur) => new Promise((resolve) => setTimeout(resolve, dur)); // Sleep function to wait for animation.

  exportDataAsync = async () => {
    let csvString = exportDataTable();
    let doc = new jsPDF('p', 'pt', 'a4');

    await addImageToPDF(doc);

    zipFiles(csvString, doc);
    // Open infoContainer once done printing
    $('.infoContainer').removeClass('closed');
  };

  function exportDataTable() {
    // Convert datatable export into CSV string
    let columnsToExport = [0, 1, 2, 3, 4, 5, 7, 8, 9];

    let table = $('#jq_datatable').DataTable();
    let data = table.buttons.exportData({
      modifier: {
        search: 'none',
      },
      columns: columnsToExport,
    });
    let csvArray = [];
    let header = data.header.join(',');
    csvArray.push(header);
    data.body.forEach((entry) => {
      let line = entry.join(',');
      csvArray.push(line);
    });
    let csvString = csvArray.join('\n');
    return csvString;
  }

  function zipFiles(CSV_String, jsPDF_file) {
    if (!CSV_String) return;
    if (!jsPDF_file) return;
    let zip = new JSZip();
    zip.file('graphs.pdf', jsPDF_file.output(), {
      binary: true,
    });
    zip.file('datatable.csv', CSV_String);
    zip
      .generateAsync({
        type: 'blob',
      })
      .then((content) => {
        //FileSaver.js
        // Get only search desc as title
        let filename = document.getElementsByClassName('search-description')[0].getElementsByTagName('h4')[0]
          .textContent.split(' ').join('');
        let date = new Date().toLocaleDateString();
        saveAs(content, `${filename}-${date}.zip`);
      });
  }

  async function addImageToPDF(doc) {
    return new Promise(async (resolve) => {
      // Generate PDF
      let docWidth = 595;
      let docHeight = 842;
      let xMargin = 25;
      let yMargin = 25;
      doc.setFontType('normal');
      doc.setFontSize('15');

      let title = document.getElementsByClassName('search-description')[0].textContent;
      title = doc.splitTextToSize(title, 550); //Split long text
      doc.text(xMargin, yMargin, title);
      //Functions in convertDomToImage.js
      const [piechart, hist, map, cards] = await Promise.all([
        convertDomToImageAsync('#pieChart').catch(async (e) => {
          console.log(e);
          doc.text(0, 40, 'Error exporting the Pie Chart');
          return;
        }),
        getHist('#hist').catch(async (e) => {
          console.log(e);
          doc.text(15, 400, 'Error exporting the Histogram');
          return;
        }),
        convertDomToImageAsync('#mapid').catch(async (e) => {
          // Try another way.
          // Close infoContainer for printing
          $('.infoContainer').toggleClass('closed');
          await sleep(200); // Waits for container to close.
          return await convertDomToImage_html2canvasAsync('#mapid').catch(async (e) => {
            console.log(e);
            doc.text(0, 750, 'Error exporting the Map. \nTry zooming out of the map before exporting');
            return;
          });
        }),
        getCards('.card-container'),
      ]);

      // PDF design
      // TODO: Prettier PDF
      // PieChart
      if (piechart) doc.addImage(piechart.imgUrl, 'PNG', 0, 40);
      // Card Container
      if (cards) {
        let posx = xMargin;
        let posy = piechart.height || 250;
        cards.forEach((c) => {
          let cardWidth = c.width / 2;
          let cardHeight = c.height / 2;
          doc.addImage(c.imgUrl, 'PNG', posx, posy, cardWidth, cardHeight);
          if (posx + cardWidth * 2 < docWidth) posx += cardWidth;
          else {
            posx = xMargin;
            posy += cardHeight;
          }
        });
      }
      if (hist) {
        doc.addPage('a4');
        doc.addImage(hist[0].imgUrl, 'PNG', xMargin, yMargin, hist[0].width, hist[0].height);
        doc.addImage(hist[1].imgUrl, 'PNG', xMargin, hist[0].height + 25, hist[1].width, hist[1].height);
      }
      if (map) {
        doc.addPage('a4', 'l');
        doc.addImage(map.imgUrl, 'PNG', 0, 70, map.width * 0.5, map.height * 0.5);
      }
      return resolve();
    });
  }

  function getHist(histContainer) {
    let histTransDur = 300; // Histogram transform duration.
    return new Promise(async (resolve, reject) => {
      let hist1 = await convertDomToImageAsync(histContainer).catch((e) => {
        return reject(e);
      });
      $('.hist_btn2').click();
      await sleep(histTransDur);
      let hist2 = await convertDomToImageAsync(histContainer).catch((e) => {
        return reject(e);
      });
      return resolve([hist1, hist2]);
    });
  }

  async function getCards(container) {
    // document.getElementsByClassName('card-container')[0].getElementsByClassName('row')[0].children;
    // card[0].children[0].className
    let elements;
    // Gets the card container in statistic tab.
    if (container.startsWith('#')) {
      elements = document.getElementById(container.slice(1))[0].getElementsByClassName('row')[0].children;
    } else if (container.startsWith('.')) {
      elements = document.getElementsByClassName(container.slice(1))[0].getElementsByClassName('row')[0].children;
    }

    let cards = [];
    for (let i = 0; i < elements.length; i++) {
      let cardClass = elements[i].children[0].className; // Gets the card class name
      let card = await convertDomToImageAsync(`.${cardClass}`).catch(async (e) => {
        return reject(e);
      });
      cards.push(card);
    }
    return cards;
  }
})();
