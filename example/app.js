/*
  example express application using Jugo
  @bsouthga
  π-day/2015
*/

var express = require('express'),
    fs = require('fs'),
    _ = require('lodash'),
    handlebars = require('handlebars'),
    // jugo library (local ref)
    jugo = require('../'),
    // jugo config
    jugo_config = require('./jugo.json');

// express app + jugo objects
var app = express(),
    J = jugo(jugo_config);

app.get('/', function (req, res) {
  res.send('Hello World!')
})

// database query api
app.get('/get/:query', function(req, res) {
  var params = getJsonFromUrl(req.params.query);

  var max, min;

  if (params.max) {
    var date_num = parseInt(params.max);
    if (!isNaN(date_num)) {
      max = new Date(date_num);
    }
  }

  if (params.min) {
    var date_num = parseInt(params.min);
    if (!isNaN(date_num)) {
      min = new Date(date_num);
    }
  }

  J.get({max_date : max, min_date : min}, function(results) {
    var vals = _.chain(results)
        .sortBy('mentions')
        .takeRight(20)
        .map(function(r) {
          return {
            "url" : r._id,
            "count" : r.mentions
          };
        })
        .reverse()
        .value();

    res.send(vals);
  });
})

app.get('/404', function(req, res) {
  res.status(404);
  res.send('<html><body>404</body></html>')
})

app.use(function(req, res, next) {
  res.redirect('/404');
});

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('listening at http://%s:%s', host, port)
})


function getJsonFromUrl(query) {
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}
