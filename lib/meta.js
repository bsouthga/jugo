/*
  metadata schema for url
*/

var mongoose = require('mongoose');

var metaSchema = mongoose.Schema({
    url : { type: [String], index: true },
    title : String,
    image : String,
    author : String,
    description : String,
    date : String
})

module.exports = mongoose.model('Most', metaSchema);
