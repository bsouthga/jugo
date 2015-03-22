/*
  jugo object
*/

var database = require('./lib/database.js'),
    monitor = require('./lib/monitor.js'),
    universe = require('./lib/universe.js');


/*
  jugo object init

  @param config::object <- jugo config object

  returns object {
    collect:: function() <- start collector daemon
    get:: function(query, callback) <- get tweet aggregates
  }
*/

function jugo(config) {

  var db = database(config);

  var currently_open = false;

  var self = {
    collect : collect,
    open : open,
    get : get
  };

  function open(callback) {
    currently_open = true;
    db.open(callback)
    return this;
  }

  function collect() {
    console.log("opening twitter stream...")
    this.open(function() {
      // get authorities and their followers...
      universe(config).populate(function(auth_data) {
        // stream tweets from authorities and followers...
        console.log('collecting...')
        monitor(config, auth_data).tweet(function(tweet){
          // add tweet to database
          db.add(tweet);
        })
        // begin collecting
        .init();
      });
    })
    return this;
  }

  function get(query, callback) {
    if (!currently_open) throw "database not initialized";
    query = query || {};
    db.get(query, function(results) {
      callback(results);
    })
    return this;
  }

  return self;

}


module.exports = jugo;