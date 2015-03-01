/*
  twit wrapper object
*/

var log = console.log.bind(console);
var _ = require('lodash');

var Twit = require('twit'),
    jugo_config = require('./jugo.json'),
    T = new Twit(jugo_config.twitter);

T.get('followers/ids', { screen_name: 'natesilver538' },  function (err, data, response) {

  var stream = T.stream('statuses/filter', {
    follow: data.ids
  })

  stream.on('tweet', function (tweet) {
    console.log('@'+tweet.user.screen_name + ':::' + tweet.text)
  })

  stream.on('warning', function (warning) {
    console.log(warning)
  })

  stream.on('error', function (error) {
    console.log(error)
  })

})