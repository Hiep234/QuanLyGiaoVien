const mongoose = require('mongoose');

const salaryRateSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true, // Đảm bảo mỗi năm học chỉ có một định mức
    match: [/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY (ví dụ: 2024-2025)']
  }, // Năm học (VD: "2024-2025")
  ratePerPeriod: { type: Number, required: true }, // Tiền cho một tiết chuẩn
  description: String,
  isActive: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SalaryRate', salaryRateSchema); 