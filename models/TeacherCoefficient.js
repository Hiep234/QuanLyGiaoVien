const mongoose = require('mongoose');

const teacherCoefficientSchema = new mongoose.Schema({
  degreeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Degree', required: true }, // Liên kết với bảng Degree
  coefficient: { type: Number, required: true }, // Hệ số tương ứng
  description: String,
  isActive: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TeacherCoefficient', teacherCoefficientSchema); 