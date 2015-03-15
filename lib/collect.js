/*
  collect post instances from tweet, and save to database
*/

var Post = require('./post.js');
var Meta = require('./meta.js');
var scrape = require('./scrape.js');


/*
  Collect urls from tweets, each stored
  in a separate post object

  @param tweet (object) : tweet object returned from twitter api
*/
function collect(tweet) {

  var urls = tweet.entities.urls;

  // each url gets its own record
  urls && urls.forEach(function(url) {

    var post_url = url.expanded_url || url.url;

    // add url mention entry into Post schema
    new Post({
      url : post_url,
      date : new Date(tweet.created_at),
      account : tweet.user.screen_name,
      followers : tweet.user.followers_count,
      retweets : tweet.retweet_count,
      favorites : tweet.favorite_count
    }).save(function(e, post) {
      if (e) {
        console.log("Post insert error: " + e);
      }
    });

    // check if metadata is already stored for url
    Meta.count({url : post_url}, function(error, count) {
      // if the url is not yet scraped...
      if (!error && count === 0) {
        addMetaData(post_url);
      }
    })

  });

}

/*
  try different meta graph possibilities
*/
function getProp(p, m) {
  return  (m.og && m.og[p]) ||
          (m.twitter && m.twitter[p]) ||
          (m.article && m.article[p]) ||
          (m.fb && m.fb[p]) ||
          m.other[p] || "";
}

function addMetaData(url) {
  // scrape
  scrape(url, function(m) {
    // add metadata info if not already in database
    new Meta({
      url : url,
      title : getProp('title', m),
      image : getProp('image', m),
      author : getProp('author', m),
      description : getProp('description', m),
      date : getProp('date', m)
    }).save(function(e, meta) {
      if (e) {
        console.log("Meta insert error: " + e);
      }
    });
  });
}



module.exports = collect;
