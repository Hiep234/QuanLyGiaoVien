const mongoose = require('mongoose');

const salaryRateSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Tên định mức (VD: "Định mức chuẩn 2024")
  ratePerPeriod: { type: Number, required: true }, // Tiền cho một tiết chuẩn
  description: String,
  isActive: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SalaryRate', salaryRateSchema); 