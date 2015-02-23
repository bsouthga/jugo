

var twitter = require('./twitter.js'),
    database = require('./database.js'),
    collect = require('./collect.js');

database.open(function() {
  twitter.timeline('mpcarv', function(err, tweets) {
    tweets.forEach(collect)
  })
})


