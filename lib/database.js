
var mongoose = require('mongoose');

function database(config) {

  function open(callback) {
    mongoose.connect(config.database);
    mongoose.connection
      .on('error', console.error.bind(console, 'database connection error:'))
      .once('open', callback);
    return this;
  }

  return {
    open : open
  }

}



module.exports = database;

