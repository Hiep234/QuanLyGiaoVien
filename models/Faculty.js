const mongoose = require('mongoose');
module.exports = mongoose.model('Faculty', new mongoose.Schema({
  fullName: String,
  shortName: String,
  description: String
}, { timestamps: true }));