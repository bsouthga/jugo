/*
  database init functions
*/

var MongoClient = require('mongodb').MongoClient,
    add = require('./add.js'),
    process = require('./process.js');

function wcb(err, docs) {
  if (err) throw err;
}


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

  var self = {
    db : null,
    open : open,
    close : close,
    add : add,
    get : process
  };

  function open(callback) {
    MongoClient.connect(config.database, function(err, connection) {
      if(err) throw err;

      self.db = connection;

      // create / init post/meta  collections
      self.posts = connection.collection('posts');
      self.meta = connection.collection('meta');

      // expire posts after one day
      self.posts.createIndex( { "date": 1 }, { expireAfterSeconds: 60*60*24 }, wcb);
 
      // expire meta info after one day
      self.meta.createIndex( { "date": 1 }, { expireAfterSeconds: 60*60*24 }, wcb);

      callback();
    })
    return this;
  }

  function close() {
    self.db && self.db.close();
    return this;
  }

  return self;

}



module.exports = database;

