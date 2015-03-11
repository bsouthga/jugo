/*
  Set up stream to monitor universe.
  emit events:
    universe.tweet
*/

var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    Twit = require('twit'),
    jugo_config = require('./jugo.json');

var T = new Twit(jugo_config.twitter);

function monitor(authorities) {

  var e = new EventEmitter();

  function init() {
    authorities.forEach(function(auth) {
      T.get('followers/ids', { screen_name: auth },  function (err, data, response) {
        var stream = T.stream('statuses/filter', {
          follow: data.ids
        })
        stream.on('tweet', function (tweet) {
          e.emit('tweet', tweet);
        })
        stream.on('warning', function (warning) {
          console.log(warning)
        })
        stream.on('error', function (error) {
          console.log(error)
        })
      })
    })
    return this;
  }

  function tweet(callback) {
    e.on('tweet', callback);
    return this;
  }

  return {
    tweet : tweet,
    init : init
  }
}


module.exports = monitor;