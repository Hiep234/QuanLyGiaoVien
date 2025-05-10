const mongoose = require('mongoose');
module.exports = mongoose.model('Degree', new mongoose.Schema({
  fullName: String,
  shortName: String
}, { timestamps: true }));