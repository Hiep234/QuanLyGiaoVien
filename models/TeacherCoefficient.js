const mongoose = require('mongoose');

const teacherCoefficientSchema = new mongoose.Schema({
  degreeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Degree', required: true }, // Liên kết với bảng Degree
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

// Đảm bảo tính duy nhất cho mỗi degree trong cùng năm học
teacherCoefficientSchema.index({ degreeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('TeacherCoefficient', teacherCoefficientSchema); 