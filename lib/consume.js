
var Post = require('./post.js');
var database = require('./database.js')

database.open(function(){
  Post.find(function(err, results) {
    console.log(results);
  });
});

