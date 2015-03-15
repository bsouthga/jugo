
var Twit = require('twit'),
    _ = require('lodash'),
    queue = require('queue-async');


function universe(config) {

  // twitter api instance
  var T = new Twit(config.twitter);


  /*
  ** wait until api rate limit resets
  **
  ** @param status::{reset::Number, remaining::Number}
  **   twitter api rate status object
  **
  ** @param callback::function()
  **   function to execute after waiting
  */
  function wait(status, callback) {
    if (status.remaining > 0) {
      callback();
    } else {
      var duration = status.reset - (new Date.getTime()) + 10;
      console.log('Waiting for ' + (duration/1000) + ' seconds...');
      setTimeout(callback, duration);
    }
  }

  /*
  ** Get user ids of 5000 friends of given user_id
  **
  ** @param user_id::number
  **   twitter numeric id of user to collect from
  **
  ** @param callback::function(error, results)
  **    callback given error and results
  */
  function getIDs(user_id, callback) {

    T.get('application/rate_limit_status', function(e, status) {

      // if error, fire callback immediately
      if (e) {
        callback(e, {});
        return null;
      }

      // get current follower id rate status
      var status = status.resources.friends['/friends/ids'];

      // if necessary, defer collection of ids until rate reset
      wait(status, function() {
        // once rate limit reset, collect ids
        T.get(
          'friends/ids',
          { user_id: user_id },
          function (err, data, resp) {
            callback(err, {
              "user" : user_id,
              "friends" : data && data.ids || []
            });
          }
        ); // T.get('friends/ids', ...)

      }); // wait(...)

    }); // T.get('application/rate_limit_status', ...)

  }


  /*
  ** construct callback function for 'users/lookup' api request
  **
  ** @param callback::function()
  **   function to execute after waiting
  */
  function processAuth(callback) {

    return function(e, auths, alt) {

      // if error, fire callback immediately
      if (e) {
        callback(e, []);
        return null;
      }

      // instantiate queue for async loading of IDs
      var q = queue();

      // collect follower ids for each authority
      _.each(auths, function(a) {
        if (a.id !== undefined) q.defer(getIDs, a.id);
      });

      // await async collection of all ids
      q.awaitAll(function(e, results) {
        if (e) console.log("processAuth Error : " + e);
        callback(results);
      });

    };

  }


  /*
  ** Collect user IDs for authorities and their friends.
  **
  **
  ** @param callback::function(error, results)
  **    callback given error and results
  */
  function populate(callback) {

    var authorities = config.accounts;

    T.get('application/rate_limit_status', function(e, status) {

      // get rate limit info for user lookup
      var lookup_status = status.resources.users['/users/lookup'];

      wait(lookup_status, function() {

        // get data for list of users
        T.get(
          'users/lookup',
          {screen_name : authorities},
          processAuth(callback)
        );

      }); // wait(...)

    }); // T.get('application/rate_limit_status',...)

  }

  return {
    wait : wait,
    getIDs : getIDs,
    processAuth : processAuth,
    populate : populate
  }

}

module.exports = universe;
