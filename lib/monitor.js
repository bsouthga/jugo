/*
  Set up stream to monitor universe.
*/

var EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    Twit = require('twit');


/*
  tap into stream api to monitor authorities + friends

  @param config::object <- jugo config object containing twitter auth
  @param authorities::array <- array of objects {
      user : id,
      friends : [ids...]
    }
  returns : monitor object {
    tweet : function(callback) { ... } <- set callback for tweet events
    init <- initialize twitter api stream
  }
*/
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