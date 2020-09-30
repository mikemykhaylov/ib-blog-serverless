const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  author: String,
  content: String,
  description: String,
  indexName: { type: String, unique: true },
  image: String,
  postedOn: { type: Date, default: Date.now },
  tag: String,
  title: String,
  readingTime: Number,
});
module.exports = mongoose.model('Post', PostSchema);
