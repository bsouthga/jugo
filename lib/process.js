/*
  find most popular stories given parameters
*/

var Post = require('./post.js'),
    Meta = require('./meta.js'),
    _ = require('lodash');

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
        mentions: { $sum: 1 },
        weighted_mentions : { $sum : "$followers" },
        first: { $min: "$date" },
        last: { $max: "$date" }
      }
    }
  ];

  Post.aggregate(agg, function(err, results) {
    if (err) { console.log(err); }

    var vals = _.chain(results)
        .sortBy('mentions')
        .takeRight(opts.num || 20)
        .map(function(r) {
          return {
            "url" : r._id,
            "count" : r.mentions
          };
        })
        .reverse()
        .value();

    Meta.find({
        url : { $in: _.pluck(vals, 'url') }
    }, function(err, docs){

      var meta_dict = {};

      docs.forEach(function(d) { meta_dict[d.url] = d; })

      callback(vals.map(function(r) {
        r.meta = meta_dict[r.url] || {};
        return r;
      }));

    });

  });

}


module.exports = process;