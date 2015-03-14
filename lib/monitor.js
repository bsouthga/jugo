/*
  Set up stream to monitor universe.
  emit events:
    universe.tweet
*/

var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    Twit = require('twit');


function monitor(config, authorities) {

  var T = new Twit(config.twitter);

  var e = new EventEmitter();

  function init() {

    var ids = _.reduce(authorities, function(o, v) {
        return o.concat(v.friends.concat([v.user]));
      }, []);

    ids = _.chain(ids)
      .shuffle() // randomize
      .take(5000)
      .value(); // take max of 5000 people

    var stream = T.stream('statuses/filter', {
      follow: ids
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