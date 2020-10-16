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

    await generatePDF(doc);
    // doc.save('test.pdf');

    zipFiles(csvString, doc);

    // Open infoContainer once done printing
    $('.infoContainer').removeClass('closed');
  };

  function exportDataTable() {
    // Convert datatable export into CSV string
    let columnsToExport = [0, 1, 2, 3, 4, 5, 8, 9, 10, 11];

    let table = $('#jq_datatable').DataTable();
    let data = table.buttons.exportData({
      modifier: {
        search: 'applied',
        order: 'applied',
      },
      columns: columnsToExport,
    });
    let csvArray = [];
    let delimeter = ';';
    let header = data.header.join(delimeter);
    csvArray.push(header);
    data.body.forEach((entry) => {
      let line = entry.join(delimeter);
      csvArray.push(line);
    });
    let csvString = csvArray.join('\n');
    return csvString;
  }

  function zipFiles(CSV_String, jsPDF_file) {
    // console.log(jsPDF_file);
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
        let filename = document
          .getElementsByClassName('search-description')[0]
          .getElementsByTagName('h4')[0]
          .textContent.split(' ')
          .join('');
        let date = new Date().toLocaleDateString();
        saveAs(content, `${filename}-${date}.zip`);
      });
  }

  function getMultiSearchQuery(queryArr) {
    let tmp = [];
    let titleObj = {
      zip: 'ZipCode',
      county: 'County',
      mpo: 'MPO',
      region: 'NYS Region',
      mun: 'Municipality',
      circle: 'Circle Drawing',
      rectangle: 'Rectangle Drawing',
      line: 'Line Drawing',
      road: 'Road Section',
    };
    for (let query of queryArr) {
      tmp.push({
        type: titleObj[query.type],
        name: query.name,
      });
    }
    return tmp;
  }

  async function generatePDF(doc) {
    return new Promise(async (resolve) => {
      // Generate PDF
      let xMargin = 25;
      let yMargin = 25;
      doc.setFontType('normal');
      doc.setFontSize('15');
      let title = document.getElementsByClassName('search-description')[0].textContent.trim();
      let pdfTitle = doc.splitTextToSize(title, 550); // Split long text
      doc.text(xMargin, yMargin, pdfTitle);

      // Multisearch table
      let haveMultiSearch = false;
      if (title.startsWith('Multisearch')) {
        let list = $('.multi-query-list').data('queryList');
        if (list && list.length > 0) {
          haveMultiSearch = true;
          let body = getMultiSearchQuery(list);
          doc.autoTable({
            body: body,
            columns: [{header: 'Query Type', dataKey: 'type'}, {header: 'Value', dataKey: 'name'}],
            startY: yMargin + 20,
            theme: 'grid',
          });
        }
      }
      // Filter Page
      let haveFilter = false;
      let naicsFilter = _pie_naics.getOpenSegments();
      let matchCDFilter = _pie_matchcd.getOpenSegments();
      if(naicsFilter.length > 0 || matchCDFilter.length > 0){
        if(haveMultiSearch) doc.addPage('a4');
        haveFilter = true;
        let filter = [];
        let subTitle = ''
        if (naicsFilter.length > 0) {
          subTitle = 'NAICS Filter(s)';
          for(data of naicsFilter) filter.push(data.data);
        } else if (matchCDFilter.length > 0) {
          subTitle = 'Match Code Filter(s)';
          for(data of matchCDFilter) filter.push(data.data);
        }
        doc.text(subTitle, getCenterTextX(subTitle, doc), yMargin + 30);
        doc.autoTable({
          body: filter,
          columns: [
            {header: 'Label', dataKey: 'label'},
            {header: 'Code', dataKey: 'search'},
            {header: 'Percentage', dataKey: 'percentage'},
          ],
          theme: 'grid',
          startY: yMargin + 40,
        });
      }

      let mapExportOptions = {
        style: {
          height: mymap.getSize().x,
          width: mymap.getSize().y,
        },
      };

      if ($('.mapContainer').hasClass('sideBar-open')) {
        mapExportOptions = {
          style: {left: '0%', width: '100%'},
        };
      }
      // Functions in convertDomToImage.js
      const [piechart, hist, map, cards] = await Promise.all([
        getPieCharts().catch(async (e) => {
          console.log(e);
          doc.text(0, 40, 'Error exporting the Pie Chart');
          return;
        }),
        getHist('#hist').catch(async (e) => {
          console.log(e);
          doc.text(15, 400, 'Error exporting the Histogram');
          return;
        }),
        convertDomToImageAsync('#mapid', mapExportOptions).catch(async (e) => {
          // Try another way.
          console.log('another way');
          // Close infoContainer for printing
          $('.infoContainer').toggleClass('closed');
          $('.infoContainer').finish();
          await sleep(350); // Waits for container to close.
          return await convertDomToImage_html2canvasAsync('#mapid').catch(async (e) => {
            console.log(e);
            doc.text(0, 750, 'Error exporting the Map. \nTry zooming out of the map before exporting');
            return;
          });
        }),
        getCards('.card-container'),
      ]);

      // PDF design
      // PieChart
      if (piechart) {
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const hratio = piechart[0].height / piechart[0].width;
        const imgWidth = pageWidth - xMargin;
        const imgHeight = (pageWidth - xMargin) * hratio;

        // Separate page if it is a multi-search and add graph title.
        if (haveMultiSearch || haveFilter) {
          doc.addPage('a4');
          doc.text(xMargin, yMargin, 'Graphs');
        }
        doc.setFontSize('13');
        let ySpacing = yMargin + 40; // From title.
        let text = 'Two Digits NAICS Pie Chart';
        doc.text(text, getCenterTextX(text, doc), ySpacing);
        const [posX, posY] = centerImgPos(pageWidth, pageHeight, imgWidth, imgHeight);
        doc.addImage(piechart[0].imgUrl, 'PNG', posX, ySpacing);
        ySpacing = ySpacing + piechart[0].height - 30;
        text = 'Match Code Pie Chart';
        doc.text(text, getCenterTextX(text, doc), ySpacing);
        ySpacing = ySpacing;
        doc.addImage(piechart[1].imgUrl, 'PNG', posX, ySpacing);
      }
      // Card Container
      if (cards) {
        let posX = xMargin;
        let posY = 300;
        const docWidth = doc.internal.pageSize.getWidth();
        if (piechart) posY = piechart[0].height + piechart[1].height + 2;

        let text = 'Statistic Cards';
        doc.text(text, getCenterTextX(text, doc), posY);
        posY += 10;
        cards.forEach((c) => {
          let cardWidth = c.width / 2;
          let cardHeight = c.height / 2;
          doc.addImage(c.imgUrl, 'PNG', posX, posY, cardWidth, cardHeight);
          if (posX + cardWidth * 2 < docWidth) posX += cardWidth;
          else {
            posX = xMargin;
            posY += cardHeight;
          }
        });
      }
      if (hist) {
        const histHeight = 400;
        doc.addPage('a4');
        doc.addImage(hist[0].imgUrl, 'PNG', xMargin, yMargin, hist[0].width, hist[0].height);
        doc.addImage(hist[1].imgUrl, 'PNG', xMargin, histHeight, hist[1].width, hist[1].height);
      }
      if (map) {
        doc.addPage('a4', 'l');
        let text = 'Map Screenshot';
        doc.text(text, getCenterTextX(text, doc), yMargin);
        // let pageHeight = doc.internal.pageSize.getHeight();
        // let pageWidth = doc.internal.pageSize.getWidth();
        // let hratio = map.height / map.width;
        // let imgWidth = pageWidth - xMargin;
        // let imgHeight = (pageWidth -xMargin) * hratio;
        // let [posX, posY] = centerImgPos(pageWidth, pageHeight, imgWidth, imgHeight);

        const imgWidth = map.width * 0.5;
        const imgHeight = map.height * 0.5;
        doc.addImage(map.imgUrl, 'PNG', 0, 100, imgWidth, imgHeight - yMargin);
        // doc.addImage(map.imgUrl, 'PNG', posX, posY, imgWidth, imgHeight);
      }
      return resolve();
    });
  }

  function centerImgPos(width, height, imgWidth, imgHeight) {
    let posX = (width - imgWidth) / 2;
    let posY = (height - imgHeight) / 2;
    return [posX, posY];
  }

  function getCenterTextX(text, doc) {
    const fontSize = doc.internal.getFontSize();
    const pageWidth = doc.internal.pageSize.width;
    let txtWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
    return (pageWidth - txtWidth) / 2;
  }

  function getPieCharts() {
    return new Promise(async (resolve, reject) => {
      let pieTransDur = 1500; // piechart redraw duration + duration of text.
      let hiddenContainer = false;
      let hiddenNAICS = false;
      let hiddenMatchCD = false;
      if (!$('.pieChartContainer').is(':visible')) {
        hiddenContainer = true;
        $('.pieChartContainer').show();
      }
      if ($('#pieChart').css('display') === 'none') {
        hiddenNAICS = true;
        $('#pieChart').show(0, async () => {
          _pie_naics.redraw();
          await sleep(pieTransDur);
          convertPieToImage();
        });
      } else {
        hiddenMatchCD = true;
        $('#pieChartMatchCD').show(0, async () => {
          _pie_matchcd.redraw();
          await sleep(pieTransDur);
          convertPieToImage();
        });
      }
      // let pieNAICS = convertDomToImageAsync('#pieChart', {style: {display: 'block'}}).catch(async (e) => {
      //   console.log(e);
      //   doc.text(0, 40, 'Error exporting the Pie Chart');
      //   return;
      // });

      // let pieMatchCD = await convertDomToImageAsync('#pieChart', {style: {display: 'block'}}).catch(async (e) => {
      //   console.log(e);
      //   doc.text(0, 40, 'Error exporting the Pie Chart');
      //   return;
      // });
      async function convertPieToImage() {
        let [pieNAICS, pieMatchCD] = await Promise.all([
          convertDomToImageAsync('#pieChart').catch(async (e) => {
            console.log(e);
            return reject(e);
          }),
          convertDomToImageAsync('#pieChartMatchCD').catch(async (e) => {
            console.log(e);
            return reject(e);
          }),
        ]);

        if (hiddenContainer) $('.pieChartContainer').hide();
        if (hiddenNAICS) $('#pieChart').hide();
        if (hiddenMatchCD) $('#pieChartMatchCD').hide();

        return resolve([pieNAICS, pieMatchCD]);
      }
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
