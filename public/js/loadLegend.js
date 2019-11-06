(() => {
  loadLegend = function() {
    d3.select('.legendContainer').on('click', () => {
      d3.select('.legendContainer').classed('open', false);
    });

    d3.select('.legendButton').on('click', () => {
      toggle = d3.select('.legendContainer').classed('open');
      d3.select('.legendContainer').classed('open', toggle ? false : true);
    });

    let data = getLegendData();

    let margin = 5;
    let width = d3.select('.legendContainer').style('width').slice(0, -2) - 2 * margin;
    let height = d3.select('.legendContainer').style('height').slice(0, -2) - 2 * margin;
    var svg = d3
      .select('.legendContainer')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height+105}`) // Height is hardcoded 
      .append('g')
      .attr('transform', 'translate(' + margin + ',' + margin + ')');

    let legendRectSize = 17;
    let legendSpacing = 4;
    let rect_size = legendRectSize + legendSpacing;

    let legend = svg
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        let vert = i * rect_size;
        return 'translate( 0,' + vert + ')';
      });

    // draw legend colored rectangles
    // legend.append('rect').attr('x', width - 50).attr('width', 17).attr('height', 17).style('fill', function(d) {
    //   return d.color;
    // });
    legend
      .append('rect')
      .attr('x', width - margin*5)
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', function(d) {
          return d.color;
        });

    // draw legend text
    legend.append('text').attr('x', (width - margin*5) - legendSpacing).attr('y', 12).style('text-anchor', 'end').text(function(d) {
      return `${d.desc} - ${d.naicsKey}`;
    });
  };

  let getLegendData = function() {
    let arr = [];
    Object.keys(twoDigitNaics).forEach((key, index) => {
      let obj = {
        naicsKey: key,
        color: colorScheme[index],
        desc: key != 56 ? twoDigitNaics[key] : 'ADM & SUP & Waste MGT & Remediation Services',
      };
      arr.push(obj);
    });
    arr.push({
      naicsKey: 99,
      color: 'black',
      desc: 'Unclassified Establishments',
    });
    return arr;
  };
})();