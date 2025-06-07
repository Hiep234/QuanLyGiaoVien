const mongoose = require('mongoose');
module.exports = mongoose.model('Assignment', new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  classSectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassSection' },
  role: String
}));
