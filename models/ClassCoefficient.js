const mongoose = require('mongoose');

const classCoefficientSchema = new mongoose.Schema({
  minStudents: { type: Number, required: true }, // Số sinh viên tối thiểu
  maxStudents: { type: Number, required: true }, // Số sinh viên tối đa
  coefficient: { type: Number, required: true }, // Hệ số tương ứng
  description: String,
  isActive: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClassCoefficient', classCoefficientSchema); 