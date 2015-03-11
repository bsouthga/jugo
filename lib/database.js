
var mongoose = require('mongoose'),
    jugo_config = require('./jugo.json');

function open(callback) {
  mongoose.connect(jugo_config.database);
  mongoose.connection
    .on('error', console.error.bind(console, 'database connection error:'))
    .once('open', callback);
  return this;
}

module.exports = {
  open : open
};

