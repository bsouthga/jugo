
var scrape = require('../lib/scrape.js');




describe('scrape.getMeta', function() {

  var test_meta = (
    '<html>' +
    '<meta name="video:publisherReadToken" content="cE97ArV7TzqBzkmeRVVhJ8O6GWME2iG_bRvjBTlNb4o." />' +
    '<meta property="video:other:long:prop" content="lah dee dah" />' +
    '</html>'
  )
  var error = null;
  var response = {statusCode : 200, headers : {}};
  response.headers['content-type'] = 'text/html';

  it('should grab meta properties of arbitrary depth', function(done) {

    var callback = function(meta) {
      var a = meta.video.publisherReadToken === "cE97ArV7TzqBzkmeRVVhJ8O6GWME2iG_bRvjBTlNb4o.";
      var b = meta.video.other.long.prop === "lah dee dah";
      if (!(a && b)) throw "meta values not collected!";
      done();
    }

    scrape.getMeta(callback, null, response, test_meta)
  })


  it('should not process non-html responses', function(done) {

    var badresponse = {
      statusCode : 200,
      headers : { "content-type" : "application/pdf" }
    }

    var callback = function(meta) {

      var keys = Object.keys(meta);

      if (!(keys.length === 1 &&
            keys[0] === "other" &&
            Object.keys(meta.other).length === 0)) {
        throw "collected meta content from content-type=application/pdf";
      }

      done();
    }

    scrape.getMeta(callback, null, badresponse, test_meta)

  })

})


describe('scrape.addProp', function() {

  var path_ONE = ['a', 'b', 'c'];
  var value_ONE = "woop";
  var tree = {};

  it('should add a value to the tree, at arbitrary depth', function(done) {
    tree = scrape.addProp(path_ONE, value_ONE, tree);
    if (tree.a.b.c !== "woop") throw "value not assigned to tree!";
    done();
  });

  var path_TWO = ['a', 'b', 'd'];
  var value_TWO = "yes indeed";

  it('should not overwrite values at arbitrary depth', function(done) {
    tree = scrape.addProp(path_TWO, value_TWO, tree);
    if (!(
           tree.a.b.c === "woop" &&
           tree.a.b.d === "yes indeed"
         )) throw "additional value assignment messes with previous values!";
    done();
  });


});