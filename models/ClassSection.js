const mongoose = require('mongoose');
module.exports = mongoose.model('ClassSection', new mongoose.Schema({
  classCode: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  studentCount: { type: Number, default: 0 },
  maxStudents: Number,
  scheduleDetails: String,
  status: String
}));
