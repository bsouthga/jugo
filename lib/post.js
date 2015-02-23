/*
  Schema for post records
*/

var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    url : String,
    date : Date,
    account : String,
    retweets : Number,
    favorites : Number,
    followers : Number
})

module.exports = mongoose.model('Post', postSchema);