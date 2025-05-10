const mongoose = require('mongoose');
module.exports = mongoose.model('Teacher', new mongoose.Schema({
  code: String,
  name: String,
  birthDate: String,
  phone: String,
  email: String,
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  degreeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Degree' }
}, { timestamps: true }));