/*
  collect post instances from tweet, and save to database
*/

var Post = require('./post.js')

/*
  Collect urls from tweets, each stored
  in a separate post object

  @param tweet (object) : tweet object returned from twitter api
*/
function collect(tweet) {

  var urls = tweet.entities.urls;

  // each url gets its own record
  urls && urls.forEach(function(url) {

    new Post({
      url : url.expanded_url || url.url,
      date : new Date(tweet.created_at),
      account : tweet.user.screen_name,
      followers : tweet.user.followers_count,
      retweets : tweet.retweet_count,
      favorites : tweet.favorite_count
    }).save(function(e, post) {
      console.log('saved : ' + post.url)
    });

  });

}


module.exports = collect;
