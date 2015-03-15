$(function() {


  var url = 'get/max=' + new Date().getTime();

  $.getJSON(url, function(data) {

    var results = d3.select('#results')
      .selectAll('div')
      .data(data)
      .enter().append('tr');

    results.append('td')
      .text(function(d, i) { return i+1; });

    results.append('td')
      .append('a')
      .attr('href', function(d) { return d.url; })
      .text(function(d) { return d.url; });

    results.append('td')
      .text(function(d) { return d.count; });

    var x = d3.scale.linear()
      .range([10, 100])
      .domain(d3.extent(data, function(d) { return d.count; }))

    results.append('td')
      .append('div')
      .attr('class', 'bar')
      .style('height', '20px')
      .style('width', function(d) {
        return x(d.count) + 'px';
      })

  });


});
