(() => {
  // Only exposing loadHistogram to the global scope
  loadHistogram = (est) => {
    return new Promise(async (resolve) => {
      d3.select('.hist_btn1').on('click', async () => {
        let thisBtn = d3.select(d3.event.target);
        if (thisBtn.classed('active')) return;
        thisBtn.attr('aria-pressed', true).classed('active', true);
        d3.select('.hist_btn2').attr('aria-pressed', false).classed('active', false);
        const data = getData_CompanyDistByEmpsz(est);
        await updateHistogram(data, 'Company distribution by employee size', 'Companies', 'Employee size');
        resolve('Histogram Loaded');
      });

      d3.select('.hist_btn2').on('click', async () => {
        let thisBtn = d3.select(d3.event.target);
        if (thisBtn.classed('active')) return;
        d3.select('.hist_btn1').attr('aria-pressed', false).classed('active', false);
        thisBtn.attr('aria-pressed', true).classed('active', true);

        const data = getData_EmployeeDist(est);
        await updateHistogram(data, 'Employee Distribution', 'Employee Size Category', 'Percentage', true);
        resolve('Histogram Loaded');
      });

      await updateCardContainer(est);
      d3.select('.hist_btn1').classed('active', false).dispatch('click');
      resolve('Histogram Loaded');
    });
  };

  let getData_EmployeeDist = (est) => {
    // Create a list of Employee Size (range)
    let obj = {};
    let total_row = est.data.length;
    est.data.map((d) => {
      let tmpObj = {};
      if (d.LEMPSZCD === null) {
        d.LEMPSZCD = 'None';
        d.LEMPSZDS = 'None';
      }

      if (obj[d.LEMPSZCD]) {
        obj[d.LEMPSZCD]['count'] += 1;
      } else {
        tmpObj['count'] = 1;
        tmpObj['ds'] = d.LEMPSZDS;
        tmpObj['total_row'] = total_row;
        obj[d.LEMPSZCD] = tmpObj;
      }
    });

    // Format the object into an Array for visualization
    // Y is going to be in percentage.
    let arr = [];
    Object.keys(obj).forEach((k) => {
      let percent = (obj[k].count / total_row * 100).toFixed(2);
      let tmpObj = {
        xValues: k,
        yValues: percent,
        sortOn: k,
        legend: obj[k].ds,
        total_row: total_row,
      };
      arr.push(tmpObj);
    });
    arr.sort((a, b) => a.sortOn.localeCompare(b.sortOn));
    return arr;
  };

  let getData_CompanyDistByEmpsz = (est) => {
    // preparing data for histogram
    let arr_employees = [],
      arr_maxemp_companies = [],
      arr_minemp_companies = [],
      arr_sales_vol = [],
      result_content = [];
    let i = 0,
      x,
      total_empl_size = 0,
      total_comp_num = 0,
      total_sales_vol = 0,
      count,
      item,
      it;

    est.data.map((est) => {
      total_comp_num += 1;
      total_empl_size += est.ALEMPSZ;
      total_sales_vol += est.ALSLSVOL;
      arr_employees.push(est.ALEMPSZ);
      arr_sales_vol.push(est.ALSLSVOL);
    });

    // grouping companies according to employee size (number of companies - unique employee size)
    while (i < arr_employees.length) {
      count = 1;
      item = arr_employees[i];
      x = i + 1;
      while (x < arr_employees.length && (x = arr_employees.indexOf(item, x)) != -1) {
        count += 1;
        arr_employees.splice(x, 1);
      }
      arr_employees[i] = new Array(arr_employees[i], count);
      if (arr_employees[i][0] !== null) {
        it = {};
        it['companies'] = count;
        it['employees'] = arr_employees[i][0];
        result_content.push(it);
      }
      ++i;
    }

    let max_employee_size = d3.max(result_content, function(d) {
      return d.employees;
    }); //result_content.reduce((max, p) => p.employees > max ? p.employees : max, result_content[0].employees);
    let min_employee_size = d3.min(result_content, function(d) {
      return d.employees;
    }); //result_content.reduce((min, p) => p.employees < min ? p.employees : min, result_content[0].employees);
    let avg_employee_size = Math.round(
      d3.mean(result_content, function(d) {
        return d.employees;
      })
    );
    let avg_sales_vol = Math.round(d3.mean(arr_sales_vol));

    est.data.map((est) => {
      if (est.ALEMPSZ === max_employee_size) {
        arr_maxemp_companies.push(est.CONAME);
      }

      if (est.ALEMPSZ === min_employee_size) {
        arr_minemp_companies.push(est.CONAME);
      }
    });

    let companies_with_min_employees = result_content.find((o) => o.employees === min_employee_size).companies;
    let companies_with_max_employees = result_content.find((o) => o.employees === max_employee_size).companies;

    let histogram_bars = [];
    it = {};
    it['xValues'] = companies_with_min_employees;
    it['yValues'] = min_employee_size;
    histogram_bars.push(it); // *pushing number of companies with min employee size

    it = {};
    it['xValues'] = companies_with_max_employees;
    it['yValues'] = max_employee_size;
    histogram_bars.push(it); // *pushing number of companies with max employee size

    // removing repeated number of companies
    let obj = {};
    for (let i = 0, len = result_content.length; i < len; i++) obj[result_content[i]['companies']] = result_content[i];

    result_content = new Array();
    for (let key in obj) result_content.push(obj[key]);
    ///

    let counter = result_content.length < 7 ? result_content.length : 7;

    for (let i = 0; i < counter; i++) {
      if (result_content[i]['employees'] > min_employee_size && result_content[i]['employees'] < max_employee_size) {
        let companies_with_given_employees = result_content.find((o) => o.employees === result_content[i]['employees'])
          .companies;
        if (
          companies_with_given_employees !== companies_with_max_employees &&
          companies_with_given_employees !== companies_with_min_employees
        ) {
          // avoiding bars in bar
          it = {};
          it['xValues'] = companies_with_given_employees;
          it['yValues'] = result_content[i]['employees'];
          histogram_bars.push(it); // **pushing number of companies with employee size in between, considering total 9 bars
        }
      }
    }

    return histogram_bars;
  };

  // Updates the histogram in '.hist'. Global scope.
  updateHistogram = async (data, title, xLabel, yLabel, isPercent = false) => {
    return new Promise((resolve) => {
      // start to load histogram
      let trans_duration = 300;
      let max_Yvalue = d3.max(data, function(d) {
        return d.yValues;
      });

      const margin = 80;
      const width = 600 - 2 * margin;
      const height = 400 - 2 * margin;

      d3.select('#hist').selectAll('div > *').remove(); // clearing histogram each time
      const svg = d3
        .select('#hist')
        .append('div')
        // Container class to make it responsive.
        .classed('svg-container', true)
        .append('svg')
        // Responsive SVG needs these 2 attributes and no width and height attr.
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', `0 0 600 400`)
        // Class to make it responsive.
        .classed('svg-content-responsive', true);

      // Create a new graph
      const graph = svg.append('svg').append('g').attr('transform', `translate(${margin}, ${margin})`);

      // INIT X axis
      let xScale = d3.scaleBand().range([0, width]).domain(data.map((s) => s.xValues)).padding(0.2);
      let xAxis = d3.axisBottom(xScale);
      graph
        .append('g')
        .attr('class', 'xaxis')
        .attr('transform', `translate(0, ${height})`)
        .transition()
        .duration(trans_duration)
        .call(xAxis);

      // INIT Y axis
      let yScale = d3.scaleLinear().range([height, 0]).domain([0, max_Yvalue]);
      let yAxis = d3.axisLeft(yScale);
      if (isPercent) {
        yScale = d3.scaleLinear().range([height, 0]).domain([0, 100]);
        yAxis = d3.axisLeft(yScale).tickFormat((d) => d + '%');
      }

      graph.append('g').attr('class', 'yaxis').transition().duration(trans_duration).call(yAxis);

      // Draw horizontal lines across graph
      const makeYLines = () => d3.axisLeft().scale(yScale);
      graph.append('g').attr('class', 'grid').call(makeYLines().tickSize(-width, 0, 0).tickFormat(''));

      // Create a Histogram
      const hist = graph.selectAll().data(data, (d) => {
        return d.xValues;
      });

      // Remove Exit tuples
      hist.exit().remove();

      // Enter new data
      const hist_enter = hist.enter().append('g');

      // Create rect and merge
      hist_enter
        .append('rect')
        .classed('rect', true)
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'bar')
        .merge(hist)
        .transition()
        .duration(trans_duration)
        .attr('x', (d) => xScale(d.xValues))
        .attr('y', (d) => yScale(d.yValues))
        .attr('height', (d) => height - yScale(d.yValues))
        .attr('width', xScale.bandwidth());

      // Histogram Event Listeners
      hist_enter
        .on('mouseenter', function(actual, i) {
          // Draw Yellow Lines
          d3.selectAll('.bar-label').attr('opacity', 0);
          d3
            .select(this)
            .transition()
            .duration(300)
            .attr('opacity', 0.6)
            .attr('x', (d) => xScale(d.xValues) - 5)
            .attr('width', xScale.bandwidth() + 10);
          const y = yScale(actual.yValues);
          line = graph.append('line').attr('id', 'limit').attr('x1', 0).attr('y1', y).attr('x2', width).attr('y2', y);

          // Update Text on top of bar
          hist_enter
            .append('text')
            .attr('class', 'divergence')
            .attr('x', (d) => xScale(d.xValues) + xScale.bandwidth() / 2)
            .attr('y', (d) => yScale(d.yValues) - 10) //was +30
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((d, idx) => {
              let divergence = d.yValues - actual.yValues;
              if (isPercent) divergence = (d.yValues - actual.yValues).toFixed(1);

              let text = `${divergence}`;
              if (divergence > 0) text = `+${divergence}`;
              return text;
            });
        })
        .on('mouseleave', function() {
          d3.selectAll('.bar-label').attr('opacity', 1);
          d3
            .select(this)
            .transition()
            .duration(300)
            .attr('opacity', 1)
            .attr('x', (a) => xScale(a.xValues))
            .attr('width', xScale.bandwidth());
          graph.selectAll('#limit').remove();
          graph.selectAll('.divergence').remove();
        });

      // Text on top of each histogram bar
      hist_enter
        .append('text')
        .attr('class', 'bar-label')
        .transition()
        .duration(trans_duration)
        .attr('x', (d) => xScale(d.xValues) + xScale.bandwidth() / 2)
        .attr('y', (d) => yScale(d.yValues) - 10) //was +30
        .attr('text-anchor', 'middle')
        .text((d) => {
          if (isPercent) return `${d.yValues}%`;
          else return `${d.yValues}`;
        });

      // Title
      svg
        .append('text')
        .attr('class', 'title')
        .transition()
        .duration(trans_duration)
        .attr('x', width / 2 + margin * 0.5)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(title);

      // X axis description
      svg
        .append('text')
        .attr('class', 'label')
        .transition()
        .duration(trans_duration)
        .attr('x', width / 2 + margin * 0.5)
        .attr('y', height + margin * 1.5)
        .attr('text-anchor', 'middle')
        .text(xLabel);

      // Y axis description
      svg
        .append('text')
        .attr('class', 'label')
        .transition()
        .duration(trans_duration)
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 3)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text(yLabel);

      // draw legend
      let legend = svg
        .selectAll('.legend')
        .data(data, (d) => {
          return d.xValues;
        })
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
          return 'translate(0,' + i * 20 + ')';
        });

      // draw legend text
      legend
        .append('text')
        .attr('x', width + 80)
        .attr('y', 50)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text((d) => {
          if (d.legend) {
            if (d.legend === 'None') return `${d.xValues} - null`;
            return `${d.xValues} - ${d.legend}`;
          }
        });

      resolve('Histogram Updated');
    });
  };

  // Updates card container in statistic tab
  updateCardContainer = (est) => {
    let totalCompanies = est.data.length;
    let totalEmployees = 0;
    let totalSalesVol = 0;
    let totalCorpSalesVol = 0;

    est.data.map((est) => {
      totalEmployees += +est.ALEMPSZ;
      totalSalesVol += +est.ALSLSVOL;
      totalCorpSalesVol += +est.ACSLSVOL;
    });

    let avgSalesVol = totalSalesVol / totalCompanies;
    let avgCSalesVol = totalCorpSalesVol / totalCompanies;
    let avgEmp = totalEmployees / totalCompanies;

    let data = [
      {
        title: 'Total Sales',
        body: `$${totalSalesVol}`,
      },
      {
        title: 'Avg Sales',
        body: `$${avgSalesVol.toFixed(2)}`,
      },
      {
        title: 'Avg Corp Sales',
        body: `$${avgCSalesVol.toFixed(2)}`,
      },
      {
        title: 'Total Companies',
        body: totalCompanies,
      },
      {
        title: 'Total Employees',
        body: totalEmployees,
      },
      {
        title: 'Avg Employees',
        body: avgEmp.toFixed(2),
      },
    ];

    // Create Cards dynamically. Could be done in ejs instead.
    d3.select('.card-container .row').selectAll('div').remove();

    let cardContainer = d3.select('.card-container .row').selectAll('div').data(data).enter();
    let cardBody = cardContainer
      .append('div')
      .merge(cardContainer)
      .classed('col-sm-6 col-md-4 col-lg-3 pb-2', true)
      .append('div')
      .attr('class', function(d) {
        return 'card' + ' ' + d.title.toLowerCase().split(' ').join('');
      })
      .append('div')
      .classed('card-body', true);
    cardBody.append('h5').classed('card-title', true).text((d) => {
      return d.title;
    });
    cardBody.append('div').classed('card-text float-right', true).text((d) => {
      return toCommas(d.body);
    });

    cardContainer.exit().remove();
  };

  // Helper function that helps converting numbers to number with commas for error displaying purposes.
  let toCommas = function(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
})();
