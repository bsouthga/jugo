
var database = require('./lib/database.js'),
    monitor = require('./lib/monitor.js'),
    collect = require('./lib/collect.js'),
    universe = require('./lib/universe.js');


function jugo(config) {

  function collect() {
    // open database...
    database.open(function() {
      // get authorities and their followers...
      universe.populate(config.accounts, function(auth_data) {
        // stream tweets from authorities and followers...
        monitor(auth_data).tweet(function(tweet){
          // each time there is a tweet, log and collect
          console.log('@'+tweet.user.screen_name + ':::' + tweet.text);
          collect(tweet);
        })
        // begin collecting
        .init();
      });
    });
  }

  return {
    collect : collect
  }

}

var jugo_config = require('./lib/jugo.json');

jugo().collect(jugo_config)

//module.exports = jugo;