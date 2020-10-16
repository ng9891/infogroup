let _pie_naics = undefined;
let _pie_matchcd = undefined;
function loadPieChart(establishments) {
  return new Promise((resolve) => {
    let naicsObj = {};
    let matchCDObj = {};
    establishments.data.map((est) => {
      // arr_data.push(est.NAICSDS);
      // Setting up data for the pie chart. eg. Count and section color.
      if (est.NAICSCD) {
        let twoDigitCode = est.NAICSCD.toString().slice(0, 2);
        let color = naicsKeys[twoDigitCode] ? naicsKeys[twoDigitCode].color : 'black';

        if (naicsObj[twoDigitCode]) naicsObj[twoDigitCode].count += 1;
        else {
          let tmp = {
            count: 1,
            label: twoDigitNaics[twoDigitCode] ? twoDigitNaics[twoDigitCode].toUpperCase() : est.NAICSDS,
            color: color,
          };
          naicsObj[twoDigitCode] = tmp;
        }
      }

      let matchCDKey = est.MATCHCD;
      if (!est.MATCHCD) {
        matchCDKey = 'NULL';
      }
      if (matchCDObj[matchCDKey]) matchCDObj[matchCDKey].count += 1;
      else {
        let tmp = {
          count: 1,
          color: _matchCDColorScheme[matchCDKey] ? _matchCDColorScheme[matchCDKey] : 'black',
          label: _matchCDObj[matchCDKey] ? _matchCDObj[matchCDKey] : 'UNKNOWN',
        };
        matchCDObj[matchCDKey] = tmp;
      }
    });

    // Shortening some labels
    if (naicsObj[56]) naicsObj[56].label = 'ADM & SUP & Waste MGT & Remediation Services'.toUpperCase();

    let pie_content_naics = [];
    let pie_content_matchcd = [];

    Object.keys(naicsObj).map((key) => {
      let tmp = {
        label: `${naicsObj[key].label}`,
        value: naicsObj[key].count,
        color: naicsObj[key].color,
        search: key,
      };
      pie_content_naics.push(tmp);
    });

    Object.keys(matchCDObj).map((key) => {
      let tmp = {
        label: `${matchCDObj[key].label}`,
        value: matchCDObj[key].count,
        color: matchCDObj[key].color,
        search: key,
      };
      pie_content_matchcd.push(tmp);
    });

    let pie_w = 768;
    let pie_h = 320;

    _pie_matchcd = new d3pie(
      'pieChartMatchCD',
      getOptions(pie_content_matchcd, pie_w, pie_h, 11, () => {
        return;
      })
    );

    _pie_naics = new d3pie(
      'pieChart',
      getOptions(pie_content_naics, pie_w, pie_h, 10, () => {
        $('.pieChart-loader').fadeOut('slow');
        return resolve('PieChart Loaded');
      })
    );
  });

  function getOptions(content, w, h, searchCol, cb) {
    return {
      header: {
        title: {
          fontSize: 24,
          font: 'open sans',
        },
        subtitle: {
          color: '#999999',
          fontSize: 12,
          font: 'open sans',
        },
        titleSubtitlePadding: 9,
      },
      footer: {
        color: '#999999',
        fontSize: 10,
        font: 'open sans',
        location: 'bottom-left',
      },
      size: {
        canvasHeight: h, //380
        canvasWidth: w, //750
        pieOuterRadius: '70%',
      },
      data: {
        sortOrder: 'value-desc',
        content: content,
      },
      labels: {
        outer: {
          pieDistance: 32,
        },
        inner: {
          format: 'none',
          hideWhenLessThanPercentage: 3,
        },
        mainLabel: {
          fontSize: 11,
        },
        percentage: {
          color: '#ffffff',
          decimalPlaces: 2,
        },
        value: {
          color: '#adadad',
          fontSize: 11,
        },
        lines: {
          enabled: true,
        },
        truncation: {
          enabled: true,
        },
      },
      tooltips: {
        enabled: true,
        type: 'placeholder',
        string: '{label}: {percentage}%',
      },
      effects: {
        highlightSegmentOnMouseover: false,
        pullOutSegmentOnClick: {
          effect: 'linear',
          speed: 300,
          size: 8,
        },
        load: {
          speed: 300,
        },
      },
      misc: {
        gradient: {
          enabled: true,
          percentage: 100,
        },
      },
      callbacks: {
        onClickSegment: (a) => {
          // Passing an extra variable to determine which column to search on datatable.
          return filterSegment(a, searchCol);
        },
        onload: cb,
      },
    };
  }
  /**
   * Helper for onClick event.
   * @param {Object} a Object passed from onClick event form the pieChart
   * @param {*} searchCol Variable to distinquish which pieChart was clicked.
   */
  function filterSegment(a, searchCol) {
    let search = a.data.search;
    let dataTable = $('#jq_datatable').DataTable();
    if (searchCol === 11) {
      // Matchcode Pie
      let selected = _pie_matchcd.getOpenSegments();
      let content = _pie_matchcd.options.data.content;
      let graph = _pie_matchcd.cssPrefix;
      grayoutSegments(graph, selected, content.length);
      filterMap(selected, search, a.expanded, _matchcdLayers, mymap, matchCDClustermarkers);
      filterDatatable(selected, searchCol, dataTable);
      filterHistogram(dataTable);
    } else {
      // NAICS Pie
      let selected = _pie_naics.getOpenSegments();
      let content = _pie_naics.options.data.content;
      let graph = _pie_naics.cssPrefix;
      grayoutSegments(graph, selected, content.length);
      filterMap(selected, search, a.expanded, _naicsLayers, mymap, naicsClustermarkers);
      filterDatatable(selected, searchCol, dataTable);
      filterHistogram(dataTable);
    }
  }

    /**
   * Helper function to filter the histrogram and cards when a pie segment is clicked.
   * @param {Datatable Object} dt Datatable
   */
  function filterHistogram(dt) {
    let data = {
      data: dt.rows({ search: 'applied' }).data(),
    }
    loadHistogram(data);
  }
  /**
   * Helper function to filter datable when a pie segment is clicked.
   * @param {Array} selectedSegments Contains all the segments {Object} that are open for the piechart.
   * @param {Integer} searchCol Column to search on datatable
   * @param {Datatable Object} dt Datatable
   */
  function filterDatatable(selectedSegments, searchCol, dt) {
    let regex = '';
    for (segment of selectedSegments) {
      regex += segment.data.search + '|';
    }
    regex = regex.slice(0, -1);
    dt.columns(searchCol).search(regex, true, false, true).draw();
  }
  /**
   * Helper function to filter the map according to the segment selected on the pie chart.
   * This function assumes the mymap has all the layerGroup displayed on the map.
   * @param {Array} selectedSegment Contains all the segments that are open for the piechart.
   * @param {String} search The search value. Pie section that is clicked.
   * @param {Boolean} action of opening of closing the a segment. From the object passed as paremeter on the pieChart click event.
   * @param {Object} layerGroup Group of layers to filter with. eg. _naicsLayers or _matchcdLayers.
   * @param {Leaflet Map Object} map
   * @param {Leaflet Cluster Object} cluster Contains all the markers of a category.
   */
  function filterMap(selectedSegments, search, action, layerGroup, map, cluster) {
    if (action) {
      // Closing a segment.
      if (selectedSegments.length === 0) {
        // Closing all segments
        map.removeLayer(layerGroup[search].layer);
        map.removeLayer(clusterSubgroup);
        map.addLayer(cluster);
      } else {
        map.removeLayer(layerGroup[search].layer);
      }
    } else {
      // Opening a segment.
      if (selectedSegments.length > 1) {
        // Second or more selection.
        map.addLayer(layerGroup[search].layer);
      } else {
        // First selection
        map.removeLayer(cluster); // Removes cluster with all the markers.
        map.addLayer(clusterSubgroup); // Add subgroup cluster to the map.
        map.addLayer(layerGroup[search].layer); // Add layer to clusterSubgroup.
      }
    }
  }

  function grayoutSegments(graph, selected, totalSegments) {
    if (selected.length === 0) {
      for (let i = 0; i < totalSegments; i++) {
        $(`#${graph}segment${i}`).css({opacity: 1});
      }
    } else {
      for (let i = 0; i < totalSegments; i++) {
        if (!$(`#${graph}segment${i}`).hasClass(`${graph}expanded`)) $(`#${graph}segment${i}`).css({opacity: 0.4});
        else $(`#${graph}segment${i}`).css({opacity: 1});
      }
    }
  }

  function addResponsiveViewbox(id, width, height) {
    d3
      .select('.' + id)
      .selectAll('svg')
      .attr('width', null)
      .attr('height', null)
      // Replace with viewbox
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet');
  }
}
