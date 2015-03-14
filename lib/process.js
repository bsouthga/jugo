/*
  find most popular stories given parameters
*/


var Post = require('./post.js');

/*
  make request for weighted url counts in given timeframe

  @param opts::(object || function) : query config or callback
  @param callback::function : callback function
*/
function process(opts, callback) {

  callback = (opts instanceof Function ? opts : null) ||
              callback ||
              opts.callback ||
              function(){return {};};

  var date_query = {};

  // if no date query given, get all tweets in database before now
  if (!opts.min_date && !opts.max_date) {
    opts.max_date = new Date();
  }

  if (opts.min_date) {
    date_query.$gte = opts.min_date;
  }

  if (opts.max_date) {
    date_query.$lte = opts.max_date;
  }

  // build aggregation query
  var agg = [
    {
      $match : {date : date_query }
    },
    {
      $group: {
        _id: "$url",
        total: { $sum: "$followers" }
      }
    }
  ];

  Post.aggregate(agg, function(err, results) {
    if (err) { console.log(err); }
    callback(results);
  });

}


module.exports = process;