const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    code: { // Mã học phần (ví dụ: IT001)
        type: String,
        required: [true, 'Mã học phần là bắt buộc'],
        unique: true,
        trim: true,
        uppercase: true
    },
    name: { // Tên học phần (ví dụ: Nhập môn Lập trình)
        type: String,
        required: [true, 'Tên học phần là bắt buộc'],
        trim: true
    },
    credits: { // Số tín chỉ
        type: Number,
        required: [true, 'Số tín chỉ là bắt buộc'],
        min: [0, 'Số tín chỉ không được âm (>=0)'] // Có thể có học phần 0 tín chỉ (VD: Đồ án tốt nghiệp giai đoạn 1)
    },
    coefficient: { // Hệ số học phần (ví dụ: 1, 1.5, 2)
        type: Number,
        default: 1.0,
        min: [0.5, 'Hệ số tối thiểu là 0.5']
    },
    periods: { // Tổng số tiết học (lý thuyết + thực hành)
        type: Number,
        required: [true, 'Tổng số tiết là bắt buộc'],
        min: [1, 'Số tiết phải là số dương']
    },
    description: { // Mô tả chi tiết về học phần (tùy chọn)
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);