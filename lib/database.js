/*
  database init functions
*/

var mongoose = require('mongoose'),
    collect = require('./collect.js'),
    process = require('./process.js');


/*
  mongodb database object

  @param config::object <- jugo config with database url

  returns object {
    open : function(callback) <- connect to mongo database, on success run callback
    add : function(tweet) <- add tweet to database
    get : function(query, callback) <- get tweet aggregations
  }
*/
function database(config) {

  function open(callback) {
    mongoose.connect(config.database);
    mongoose.connection
      .on('error', console.error.bind(console, 'database connection error:'))
      .once('open', callback);
    return this;
  }

  function close() {
    mongoose.disconnect();
    return this;
  }

  return {
    open : open,
    close : close,
    add : collect,
    get : process
  }

}



module.exports = database;

