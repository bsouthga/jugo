/*
  twit wrapper object
*/


var Twit = require('twit'),
    jugo_config = require('./jugo.json'),
    T = new Twit(jugo_config.twitter);

function timeline(account, callback) {
  T.get('statuses/user_timeline', {
      screen_name: account,
      count: 200
    },
    function(err, data) {callback(err, data);}
  );
}

module.exports = {
  timeline : timeline
};
