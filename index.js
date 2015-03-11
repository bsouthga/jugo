
var database = require('./lib/database.js'),
    monitor = require('./lib/monitor.js'),
    collect = require('./lib/collect.js'),
    universe = require('./lib/universe.js'),
    jugo_config = require('./lib/jugo.json');


// open database...
database.open(function() {
  // get authorities and their followers...
  universe.populate(jugo_config.accounts.slice(0, 1), function(auth_data) {
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


