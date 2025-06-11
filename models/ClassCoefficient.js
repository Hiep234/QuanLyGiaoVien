const mongoose = require('mongoose');

const classCoefficientSchema = new mongoose.Schema({
  minStudents: { 
    type: Number, 
    required: true,
    min: [0, 'Số sinh viên tối thiểu không thể âm']
  }, // Số sinh viên tối thiểu
  maxStudents: { 
    type: Number, 
    required: true,
    min: [0, 'Số sinh viên tối đa không thể âm']
  }, // Số sinh viên tối đa
  coefficient: { type: Number, required: true }, // Hệ số tương ứng
  year: { // Năm học (ví dụ: "2024-2025")
    type: String,
    required: [true, 'Năm học là bắt buộc'],
    match: [/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY (ví dụ: 2024-2025)']
  },
  description: String,
  isActive: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

// Note: Overlap validation được thực hiện ở tầng application (routes)
// không dùng unique index vì cần check overlap phức tạp hơn
classCoefficientSchema.index({ year: 1, minStudents: 1 }); // Index để tối ưu query

module.exports = mongoose.model('ClassCoefficient', classCoefficientSchema); 