/*
  create universe object based on list of authorities
*/

var Twit = require('twit'),
    _ = require('lodash'),
    queue = require('queue-async');

// user twitter configuration
var jugo_config = require('./jugo.json');


// twitter api instance
var T = new Twit(jugo_config.twitter);


// wait until epoch time
function wait(status, callback) {
  if (status.remaining > 0) {
    console.log('no wait!');
    callback();
  } else {
    var wait_to = new Date(status.reset);
    console.log('waiting until ' + wait_to + '...');
    var now = (new Date).getTime();
    setTimeout(callback, (wait_to.getTime() - now) + 10);
  }
}


/*
** Get user ids of 5000 followers of given user_id
**
** @param user_id::number
**   twitter numeric id of user to collect from
**
** @param callback::function(error, results)
**    callback given error and results
*/
function getIDs(user_id, callback) {

  T.get('application/rate_limit_status', function(e, status) {

    // get current follower id rate status
    var status = status.resources.followers['/followers/ids'];

    // if necessary, defer collection of ids until rate reset
    wait(status, function() {
      // once rate limit reset, collect ids
      T.get(
        'followers/ids',
        { user_id: user_id },
        function (err, data, resp) {
          callback(err, {
            "user" : user_id,
            "followers" : data.ids
          });
        }
      )
    })

  })

}


/*
** Collect user IDs for authorities and their followers.
**
** @param authorities::Array<String>
**    list of authority screenames
**
** @param callback::function(error, results)
**    callback given error and results
*/
function universe(authorities, callback) {

  T.get('application/rate_limit_status', function(e, status) {

    // get rate limit info for user lookup
    var lookup_status = status.resources.users['/users/lookup'];

    wait(lookup_status, function() {

      // get data for list of users
      T.get('users/lookup', {screen_name : authorities}, function(e, auths, alt) {
        u.authorities = auths;
        var q = queue();

        // collect follower ids for each authority
        _.each(auths, function(a) {
          q.defer(getIDs, a.id);
        })

        // await async collection of all ids
        q.awaitAll(function(e, results) {
          console.log(e, results);
        })

      }) // T.get('users/lookup',...)

    }) // wait(...)

  }) // T.get('application/rate_limit_status',...)

}


universe(['bsouthga', 'mpcarv'])


module.exports = universe;