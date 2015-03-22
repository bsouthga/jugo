# jugo

### [fuego](https://github.com/niemanlab/openfuego) for JavaScript

## Installation

To run jugo, the following must be installed

- [NodeJS](http://nodejs.org/)
- [MongoDB](http://www.mongodb.org/)

Once both are installed, run the following to install jugo locally

```shell
npm install jugo
```

## Usage

### Collection script

To start collecting tweets from your "universe" via the [twitter gardenhose](https://dev.twitter.com/streaming/public), create a script containing the following...


```javascript

var jugo = require('jugo');

var J = jugo({
  "twitter" : {
    "consumer_key": "<INSERT KEY>",
    "consumer_secret": "<INSERT KEY>",
    "access_token": "<INSERT KEY>",
    "access_token_secret": "<INSERT KEY>"
  },
  "accounts" : [
    ... // list of accounts you want to track
  ],
  "database" : "mongodb://localhost/test" // database location
})

// start collecting
J.collect();

```

And then run it as a background process. This will collect tweets as they come in, as well as metadata scraped from the urls. The collection script creates two mongo collections `posts` and `meta` which contain documents of the following schema...


```javascript
// example post document
{
  url : post_url,
  date : new Date(tweet.created_at),
  account : tweet.user.screen_name,
  followers : tweet.user.followers_count,
  retweets : tweet.retweet_count,
  favorites : tweet.favorite_count
}

// example meta document
{
  url : url,
  title : ..., // open graph protocol title
  image : ...,// open graph protocol image
  author : ..., // open graph protocol author
  description : .., // open graph protocol description
  date : ..., // open graph protocol date
}
```

### Usage in a web app

Jugo also provides a little wrapper for aggregating and accessing the tweets in the database. For example, in node express application, one might use Jugo as follows...

```javascript

var jugo = require('jugo');

var J = jugo(jugo_config);

// open jugo database connection when app starts
J.open(function() {
  console.log('database open!')
});

// database query api
app.get('/get/:query', function(req, res) {
  var params = getJsonFromUrl(req.params.query);

  var max, min;

  if (params.max) {
    var date_num = parseInt(params.max);
    if (!isNaN(date_num)) {
      max = new Date(date_num);
    }
  }

  if (params.min) {
    var date_num = parseInt(params.min);
    if (!isNaN(date_num)) {
      min = new Date(date_num);
    }
  }

  //
  // Use jugo "get" method to find top 40 stories
  // (currently ranked by number of tweets)
  // returns ...
  // {
  //   url : (shared url)
  //   count : (number of shares in specified timeframe)
  //   meta : (object containing scraped OG protocol metadata)
  // }
  //
  J.get(
    {
      max_date : max,
      min_date : min,
      num : 40
    },
    function(results) {
      res.send(results);
    }
  );
})

```

