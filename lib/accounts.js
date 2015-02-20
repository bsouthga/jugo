var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {


  var postSchema = mongoose.Schema({
      url : String,
      date : Date
  })

  var Post = mongoose.model('Post', postSchema);

  Post.find({ url : /test1/ }, function(e, p) {
    console.log(p);
  })

  // test1 = new Post({
  //   url : "www.test1.com",
  //   date : new Date('2002')
  // })

  // test1.save(function(err, test1) {
  //   console.log('succes : ' + test1.url);
  // })

});


