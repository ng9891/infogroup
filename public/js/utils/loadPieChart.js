let _pie_naics;
let _pie_matchcd;
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

    let pie_h = 290;
    let pie_w = 700;

    _pie_matchcd = new d3pie(
      'pieChartMatchCD',
      getOptions(pie_content_matchcd, pie_w, pie_h, 10, () => {
        addResponsiveViewbox('pieChartContainer', pie_w, pie_h);
        return;
      })
    );

    _pie_naics = new d3pie(
      'pieChart',
      getOptions(pie_content_naics, pie_w, pie_h, 9, () => {
        addResponsiveViewbox('pieChartContainer', pie_w, pie_h);
        $('.pieChart-loader').fadeOut('slow');
        return resolve('PieChart Loaded');
      })
    );
    // addResponsiveViewbox(null,pie_w,pie_h)
  });

  function getOptions(content, w, h, searchCol, cb) {
    let searches = [];
    let lastChosenSegment;
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
        // formatter: function(context) {
        //   let label = context.label;
        //   if (context.section === 'outer') return label.slice(5);
        //   return label;
        // },
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
          speed: 350,
        },
      },
      misc: {
        gradient: {
          enabled: true,
          percentage: 100,
        },
      },
      callbacks: {
        onClickSegment: function(a) {
          // Filter Datatable on PieChart Segment Click
          let search = a.data.search;
          let graph = $(a.segment).attr('id').slice(0, 2);
          refreshSegmentsColors(graph, content.length);
          grayoutSegments(graph, a.index, content.length);
          if (searchCol === 10) {
            // Matchcode Pie
            mymap.removeLayer(matchCDClustermarkers);
            if (lastChosenSegment) mymap.removeLayer(_matchcdLayers[lastChosenSegment].layer);
            mymap.addLayer(_matchcdLayers[search].layer);
          } else {
            // NAICS Pie
            mymap.removeLayer(naicsClustermarkers);
            if (lastChosenSegment) mymap.removeLayer(_naicsLayers[lastChosenSegment].layer);
            mymap.addLayer(_naicsLayers[search].layer);
          }

          let dtable = $('#jq_datatable').DataTable();
          searches.push(search);
          dtable.columns(searchCol).search(search, false, true, true).draw();

          // On clicking twice to the same segment filter clears
          if (lastChosenSegment === search) {
            dtable.search('').columns().search('').draw();
            searches = [];
            if (searchCol === 10) {
              // Matchcode Pie
              // Reset to all
              mymap.addLayer(matchCDClustermarkers);
              mymap.removeLayer(_matchcdLayers[lastChosenSegment].layer);
            } else {
              // NAICS Pie
              // Reset to all
              mymap.addLayer(naicsClustermarkers);
              mymap.removeLayer(_naicsLayers[lastChosenSegment].layer);
            }
            refreshSegmentsColors(graph, content.length);
          }
          // console.log(lastChosenSegment);
          // console.log(searches);
          lastChosenSegment = searches.pop();
        },
        onload: cb,
      },
    };
  }

  function grayoutSegments(graph, currIndex, totalSegments) {
    for (let i = 0; i < totalSegments; i++) {
      if (i != currIndex) {
        $(`#${graph}_segment${i}`).css({fill: 'gray'});
      }
    }
  }

  function refreshSegmentsColors(graph, totalSegments) {
    for (let i = 0; i < totalSegments; i++) {
      $(`#${graph}_segment${i}`).css({fill: `url(#${graph}_grad${i})`});
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
