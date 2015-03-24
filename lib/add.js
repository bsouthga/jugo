/*
  collect post instances from tweet, and save to database
*/

var scrape = require('./scrape.js');

// object to keep track of current urls being scraped
var currently_collecting_metadata = {};

// throw a database error
function db_error(err) {
  if (err) throw err;
}

// collection write callback
function wcb(err, docs) {
  db_error(err);
}

/*
  database method

  Collect urls from tweets, each stored
  in a separate post object

  @param tweet (object) : tweet object returned from twitter api
*/
function add(tweet) {

  var urls = tweet.entities.urls;

  // get database collections from context
  var posts = this.posts || db_error("No posts collection!");
  var meta = this.meta || db_error("No meta collection!");

  // each url gets its own record
  urls && urls.forEach(function(url) {

    var post_url = url.expanded_url || url.url;

    // add url mention entry into Post schema
    var post = {
      url : post_url,
      date : new Date(tweet.created_at),
      account : tweet.user.screen_name,
      followers : tweet.user.followers_count,
      retweets : tweet.retweet_count,
      favorites : tweet.favorite_count
    };

    // insert post
    posts.insert(post, wcb);

    // check to see if the metadata is currently
    // being scraped for this url already
    if (!currently_collecting_metadata[url]) {
      // check if metadata is already stored for url
      meta.findOne({'url' : url}, function(err, m) {
        if (!m) {
          // we are currently scraping this url for metadata
          currently_collecting_metadata[url] = true;
          // async call to scrape url
          addMetaData(post_url, function(meta_data) {
            // scraping complete
            delete currently_collecting_metadata[url];
            // insert into database
            if (!noMeta(meta_data)) {
              meta.insert(meta_data, wcb);
            }
          }); // scrape and insert metadata
        } // check if found one
      }) // search for url in meta collection
    } // check if currently searching for metadata

  });

}


function noMeta(meta) {
  if (!(meta.other instanceof Object)) return false;
  var keys = Object.keys(meta);
  var otherKeys = Object.keys(meta.other);
  return (keys.length === 1 && otherKeys.length === 0);
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

function addMetaData(url, callback) {

  // scrape
  scrape(url, function(m) {

    var image = getProp('image', m);

    if (image instanceof Object) {
      image = image.src;
    }

    // add metadata info if not already in database
    var meta = {
      url : url,
      title : getProp('title', m),
      image : image,
      author : getProp('author', m),
      description : getProp('description', m),
      date : getProp('date', m)
    };

    callback(meta);
  });

}



module.exports = add;
