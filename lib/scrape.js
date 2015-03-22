/*
  scrape url for metadata
*/


var cheerio = require('cheerio'),
    request = require('request').defaults({
      timeout : 10000 // wait max of 8 seconds before hanging up
    });


// regex to test for open graph protocol in
// property / name attribute of meta tag
var hasOGProp = /^\w+[:\w]+\w+$/;

var htmlContent = /text\/html/;


/*
  recursively add a property to results tree,
  navigating down path array

  @param path::Array<string> <- list of ':' OG properties
  @param value::String <- content string from metatag
  @param tree::Object <- current OG property accumulation
*/
function addProp(path, value, tree) {

  var key;

  if (path.length === 1 && tree) {
    key = path[0];
    tree[key] = value;
    return tree;
  } else if (tree) {
    key = path.shift();
    if (!tree[key]) tree[key] = {};
    tree[key] = addProp(path, value, tree[key]);
  }

  return tree;
}


function getMeta(callback, error, response, body) {

    var results = {'other' : {}};

    if (!error &&
        response.statusCode == 200 &&
        htmlContent.test(response.headers['content-type'])) {

      var $ = cheerio.load(body);

      var i = 0;

      $('meta').each(function() {


        var node = $(this);
        var og = null;
        var prop = node.attr('property');
        var name = node.attr('name');
        var content = node.attr('content');

        if (prop && hasOGProp.test(prop)) {
          og = prop.split(':');
        }
        else if (name && hasOGProp.test(name)) {
          og = name.split(':');
        }
        else if (name || prop) {
          results.other[name || prop] = content;
        }

        if (og) {
          results = addProp(og, content, results) || results;
        }

      })
    }

    callback(results);
  }

/*
  get OG compatable metadata from url

  @param url::String <- url to scrape
  @param callback::function(results) <- callback with results
*/

function scrape(url, callback) {

  // cookie jar for NYT type redirect issues
  // https://github.com/request/request/issues/311
  var jar = request.jar();

  request({
      method : 'GET',
      followAllRedirects: true,
      jar: jar,
      url : url,
      headers : {
        'User-Agent' : "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410."
      }
    }, getMeta.bind(getMeta, callback))
}


scrape.addProp = addProp;
scrape.getMeta = getMeta;


module.exports = scrape;


