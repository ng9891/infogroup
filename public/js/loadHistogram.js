function loadHistogram(establishments) {

    /*****************************/
    // preparing data for histogram

    var arr_employees = [], arr_maxemp_companies = [], arr_minemp_companies=[], result_content = [];
    var i=0, x, total_empl_size=0, total_comp_num=0, count, item, it;

    establishments.data.map( est => {
      total_comp_num += 1;
      total_empl_size += est.ALEMPSZ;
      arr_employees.push(est.ALEMPSZ);
    });

    // grouping companies according to employee size (number of companies - unique employee size)
    while(i < arr_employees.length) {
      count = 1;
      item = arr_employees[i];
      x = i+1;
      while(x < arr_employees.length && (x=arr_employees.indexOf(item,x))!=-1) {
        count+=1;
        arr_employees.splice(x,1);
      }
          arr_employees[i] = new Array(arr_employees[i],count);
          if (arr_employees[i][0]!==null) {
              it = {};
              it["companies"] = count;
              it["employees"] = arr_employees[i][0];
              result_content.push(it);
          }
      ++i;
    }

    var max_employee_size = result_content.reduce((max, p) => p.employees > max ? p.employees : max, result_content[0].employees);
    var min_employee_size = result_content.reduce((min, p) => p.employees < min ? p.employees : min, result_content[0].employees);

    establishments.data.map( est => {
      if (est.ALEMPSZ === max_employee_size) {
        arr_maxemp_companies.push(est.CONAME);
      } 

      if (est.ALEMPSZ === min_employee_size) {
        arr_minemp_companies.push(est.CONAME);
      } 
    });
    
    var companies_with_min_employees = result_content.find(o => o.employees === min_employee_size).companies;
    var companies_with_max_employees = result_content.find(o => o.employees === max_employee_size).companies;

    var histogram_bars = [];
    it = {};
    it["companies"] = companies_with_min_employees;
    it["employees"] = min_employee_size;
    histogram_bars.push(it); // *pushing number of companies with min employee size

    it = {};
    it["companies"] = companies_with_max_employees;
    it["employees"] = max_employee_size;
    histogram_bars.push(it);  // *pushing number of companies with max employee size

    // removing repeated number of companies
    var obj = {};
    for ( var i=0, len=result_content.length; i < len; i++ )
        obj[result_content[i]['companies']] = result_content[i];

    result_content = new Array();
    for ( var key in obj )
        result_content.push(obj[key]);
    ///

    for (var i=0; i<7; i++) {
        if (result_content[i]["employees"] > min_employee_size && result_content[i]["employees"] < max_employee_size) {
            var companies_with_given_employees = result_content.find(o => o.employees === result_content[i]["employees"]).companies;
            if (companies_with_given_employees !== companies_with_max_employees && companies_with_given_employees !== companies_with_min_employees) { // avoiding bars in bar
                it = {};
                it["companies"] = companies_with_given_employees;
                it["employees"] = result_content[i]["employees"];
                histogram_bars.push(it); // **pushing number of companies with employee size in between, considering total 9 bars
            }
        }
    }

    //console.log(histogram_bars);
    //console.log(result_content);
    

    /****************************/
    // start to load histogram
    sample = histogram_bars;
    
      d3.select('#histogram-container').selectAll("svg > *").remove(); // clearing histogram each time
      const svg = d3.select('#histogram-container').selectAll('svg');
      //const svgContainer = d3.select('#histogram-container');
      
      const margin = 80;
      const width = 1000 - 2 * margin;
      const height = 600 - 2 * margin;
  
      const chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);
  
      const xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.companies))
        .padding(0.4)
      
      const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, max_employee_size]);
  
      const makeYLines = () => d3.axisLeft()
        .scale(yScale)
  
      chart.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));
  
      chart.append('g')
        .call(d3.axisLeft(yScale));
  
      chart.append('g')
        .attr('class', 'grid')
        .call(makeYLines()
          .tickSize(-width, 0, 0)
          .tickFormat('')
        )
  
      const barGroups = chart.selectAll()
        .data(sample)
        .enter()
        .append('g')
  
      barGroups
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (g) => xScale(g.companies))
        .attr('y', (g) => yScale(g.employees))
        .attr('height', (g) => height - yScale(g.employees))
        .attr('width', xScale.bandwidth())
        .on('mouseenter', function (actual, i) {
          d3.selectAll('.employees')
            .attr('opacity', 0)
  
          d3.select(this)
            .transition()
            .duration(300)
            .attr('opacity', 0.6)
            .attr('x', (a) => xScale(a.companies) - 5)
            .attr('width', xScale.bandwidth() + 10)
  
          const y = yScale(actual.employees)
  
          line = chart.append('line')
            .attr('id', 'limit')
            .attr('x1', 0)
            .attr('y1', y)
            .attr('x2', width)
            .attr('y2', y)
  
          barGroups.append('text')
            .attr('class', 'divergence')
            .attr('x', (a) => xScale(a.companies) + xScale.bandwidth() / 2)
            .attr('y', (a) => yScale(a.employees) - 10) //was +30
            .attr('fill', 'white')
            .attr('text-anchor', 'middle')
            .text((a, idx) => {
              const divergence = (a.employees - actual.employees).toFixed(1)
              
              let text = ''
              if (divergence > 0) text += '+'
              text += `${divergence}`
  
              return idx !== i ? text : '';
            })
  
        })
        .on('mouseleave', function () {
          d3.selectAll('.employees')
            .attr('opacity', 1)
  
          d3.select(this)
            .transition()
            .duration(300)
            .attr('opacity', 1)
            .attr('x', (a) => xScale(a.companies))
            .attr('width', xScale.bandwidth())
  
          chart.selectAll('#limit').remove()
          chart.selectAll('.divergence').remove()
        })
  
      barGroups 
        .append('text')
        .attr('class', 'employees')
        .attr('x', (a) => xScale(a.companies) + xScale.bandwidth() / 2)
        .attr('y', (a) => yScale(a.employees) - 10) //was +30
        .attr('text-anchor', 'middle')
        .text((a) => `${a.employees}`)
      
      svg
        .append('text')
        .attr('class', 'label')
        .attr('x', -(height / 2) - margin)
        .attr('y', margin / 2.4)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Employee size')
  
      svg.append('text')
        .attr('class', 'label')
        .attr('x', width / 2 + margin)
        .attr('y', height + margin * 1.7)
        .attr('text-anchor', 'middle')
        .text('Companies')
  
      svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2 + margin)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text('Company distribution by employee size')

        /* Short statistics description */
        svg
        .append('text')
        .attr('class', 'label stat-desc')
        .attr('x', width + margin + 10)
        .attr('y', 100)
        .attr('text-anchor', 'start')
        .text('Total number of companies: ' + total_comp_num)

        svg
        .append('text')
        .attr('class', 'label stat-desc')
        .attr('x', width + margin + 10)
        .attr('y', 150)
        .attr('text-anchor', 'start')
        .text('Total number of employees: ' + total_empl_size)

        svg
        .append('text')
        .attr('class', 'label stat-desc')
        .attr('x', width + margin + 10)
        .attr('y', 200)
        .attr('text-anchor', 'start')
        .text('Total sales volume: ?')

        if (arr_maxemp_companies[0].length > 26) {
          svg
          .append('text')
          .attr('class', 'label stat-desc')
          .attr('x', width + margin + 10)
          .attr('y', 250)
          .attr('text-anchor', 'start')
          .text('Max employee size comp.: ')
          svg
          .append('text')
          .attr('class', 'label stat-desc')
          .attr('x', width + margin + 10)
          .attr('y', 270)
          .attr('text-anchor', 'start')
          .text(arr_maxemp_companies[0])
        }
        else {
          svg
          .append('text')
          .attr('class', 'label stat-desc')
          .attr('x', width + margin + 10)
          .attr('y', 250)
          .attr('text-anchor', 'start')
          .text('Max employee size comp.: ' + arr_maxemp_companies[0])
        }

        if (arr_minemp_companies[0].length > 26) {
          svg
          .append('text')
          .attr('class', 'label stat-desc')
          .attr('x', width + margin + 10)
          .attr('y', 300)
          .attr('text-anchor', 'start')
          .text('Min employee size comp.: ')
          svg
          .append('text')
          .attr('class', 'label stat-desc')
          .attr('x', width + margin + 10)
          .attr('y', 320)
          .attr('text-anchor', 'start')
          .text(arr_minemp_companies[0])
        }
        else {
          svg
          .append('text')
          .attr('class', 'label stat-desc')
          .attr('x', width + margin + 10)
          .attr('y', 300)
          .attr('text-anchor', 'start')
          .text('Min employee size comp.: ' + arr_minemp_companies[0])
        }
    
};