function loadPieChart(establishments) {
  return new Promise((resolve) => {
    let obj = {};
    establishments.data.map((est) => {
      // arr_data.push(est.NAICSDS);
      if (est.NAICSCD) {
        let twoDigitCode = est.NAICSCD.toString().slice(0, 2);
        let color = naicsKeys[twoDigitCode] ? naicsKeys[twoDigitCode].color : 'black';

        if (obj[twoDigitCode]) obj[twoDigitCode].count += 1;
        else {
          let tmp = {
            count: 1,
            label: twoDigitNaics[twoDigitCode] ? twoDigitNaics[twoDigitCode].toUpperCase() : est.NAICSDS,
            color: color,
          };
          obj[twoDigitCode] = tmp;
        }
      }
    });

    // Shortening some labels
    if (obj[56]) obj[56].label = 'ADM & SUP & Waste MGT & Remediation Services'.toUpperCase();

    let pie_content = [];

    Object.keys(obj).map((key) => {
      let tmp = {
        label: `${key} - ${obj[key].label} `,
        value: obj[key].count,
        color: obj[key].color,
      };
      pie_content.push(tmp);
    });

    pie_h = LessThan17inch ? 260 : 290;
    pie_w = LessThan17inch ? 560 : 700;
    let industries = [];
    let lastChosenSegment;

    // var colorScale = d3.scale.ordinal().domain(arr_data).range(arr_naicscd);
    let pie_c = new d3pie('pieChart', {
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
        canvasHeight: pie_h, //380
        canvasWidth: pie_w, //750
        pieOuterRadius: '70%',
      },
      data: {
        sortOrder: 'value-desc',
        content: pie_content,
      },
      labels: {
        formatter: function(context) {
          let label = context.label;
          if (context.section === 'outer') return label.slice(5);
          return label;
        },
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
          decimalPlaces: 0,
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
        pullOutSegmentOnClick: {
          effect: 'linear',
          speed: 400,
          size: 8,
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
          let industry = a.data.label.slice(0, 2);
          let dtable = $('#jq_datatable').DataTable();
          industries.push(industry);
          dtable.columns(9).search(industry, false, true, true).draw(); // Column 9 is twoDigitNAICSCD

          // On clicking twice to the same segment filter clears
          if (lastChosenSegment == industry) {
            dtable.search('').columns().search('').draw();
            industries = [];
          }
          lastChosenSegment = industries.slice(-1)[0];
        },
        onload: function() {
          $('.pieChart-loader').fadeOut('slow');
          addResponsiveViewbox(pie_w, pie_h);
          resolve('PieChart Loaded');
        },
      },
    });
  });
  function addResponsiveViewbox(width, height) {
    d3
      .select('#pieChart')
      // Make Responsive
      .classed('pieContainer', true)
      .select('svg')
      // Delete old attributes
      .attr('width', null)
      .attr('height', null)
      // Replace with viewbox
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .classed('svg-content-responsive', true);
  }
}
