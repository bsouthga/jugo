var universe = require('../lib/universe.js');


/*
  Test rate limit waiting
*/
describe('universe.wait', function() {

  var start = new Date();

  var none_remaining = {"remaining" : 0, reset: (start.getTime() + 100) }
  it('should wait at least 100ms with none remaining', function(done) {
    universe.wait(none_remaining, function() {
      var now = new Date();
      var elapsed = (now - start);
      if (elapsed < 100) {
        throw "waited only " + elapsed + " seconds!"
      } else {
        done();
      }
    })
  })

  var some_remaining = {"remaining" : 5, reset: (new Date()).getTime() }
  it('should fire callback with some remaining', function(done) {
    universe.wait(some_remaining, function() {
      done();
    })
  })

});
