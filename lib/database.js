
var mongoose = require('mongoose'),
    collect = require('./collect.js'),
    process = require('./process.js');

function database(config) {

  function open(callback) {
    mongoose.connect(config.database);
    mongoose.connection
      .on('error', console.error.bind(console, 'database connection error:'))
      .once('open', callback);
    return this;
  }

  return {
    open : open,
    add : collect,
    get : process
  }

}



module.exports = database;

