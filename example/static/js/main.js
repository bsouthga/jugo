$(function() {


  var container = d3.select('#cards');


  $(".button-collapse").sideNav();


  var $buttons = $('.hour-btn');

  $buttons.click(function() {
    $buttons.removeClass('active');
    $(this).addClass('active');
    var hours = parseFloat(this.id.split('-')[1]);
    request({
      max : new Date().getTime(),
      min : new Date().getTime() - hours*60*60*1000
    }, renderCards);
  })

  request({max : new Date().getTime()}, renderCards);

  function request(params, callback) {

    container.html('').append('div')
      .attr('class', 'spinner')
      .selectAll('div')
      .data(d3.range(1,5))
      .enter().append('div')
      .attr('class', function(d) { return 'rect' + d; });

    var p = [];
    ['min', 'max', 'count'].forEach(function(k) {
      if (params[k]) p.push(k + "=" + params[k]);
    })
    $.getJSON("get/" + p.join('&'), callback);
  }

  function renderCards(data) {

    if (data.length === 0) {
      container.html('')
        .append('div')
        .attr('class', 'no-results')
        .text('nothing here...')
      return null;
    }

    data = data.map(function(r) {
      r.pastel = randPastel();
      return r;
    });

    var cards = container.html('')
      .selectAll('div')
        .data(data).enter()
      .append('div')
        .attr('class', 'col s12 m6')
      .append('div')
        .attr('class', 'card medium');

    cards.each(function(d, i) {

      var div = d3.select(this).append('div')
        .attr('class', 'card-image waves-effect waves-block waves-light')
        .style('position', 'relative');

      if (d.meta.image) {
        div.append('img')
        .attr('class', 'activator')
        .attr('src', d.meta.image);
      } else {
        div.style("background-color", d.pastel);
      }

      div.append('span')
        .attr('class', 'tweet-count z-depth-1')
        .text("" + d.count + " tweets")
        .style('color', "#000")
        .style('background-color', "#fff")

    })

    var content = cards.append('div')
      .attr('class', 'card-content');

    content.append('span')
      .attr('class', "card-title grey-text text-darken-4")
      .append('a')
      .attr('href', function(d) { return d.url; })
      .text(function(d, i) { return "#" + (i+1) + ": " + (d.meta.title || d.url); })

    content.append('p')
      .text(function(d) { return d.meta.description; })

  }


  function rVal() {
    return ((Math.random()*255 + 255) / 2) | 0;
  }


  function randPastel() {
    var rgb = [rVal(), rVal(), rVal()].join(",");
    return "rgb(" + rgb + ")";
  }


  function textColor(background) {
    var rgb = background
                .replace('rgb(', '')
                .replace(')', '')
                .split(',')
                .map(parseFloat);
    var b = ((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000;
    return b > 150 ? "#555" : "#fff";
  }

});
