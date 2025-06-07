const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    name: { // Tên kì học (ví dụ: "Học kì 1", "Học kì hè")
        type: String,
        required: [true, 'Tên kì học là bắt buộc'],
        trim: true
    },
    year: { // Năm học (ví dụ: "2024-2025")
        type: String,
        required: [true, 'Năm học là bắt buộc'],
        match: [/^\d{4}-\d{4}$/, 'Năm học phải có định dạng YYYY-YYYY (ví dụ: 2024-2025)']
    },
    startDate: { // Ngày bắt đầu kì học
        type: Date,
        required: [true, 'Ngày bắt đầu là bắt buộc']
    },
    endDate: { // Ngày kết thúc kì học
        type: Date,
        required: [true, 'Ngày kết thúc là bắt buộc'],
        validate: {
            validator: function(value) {
                // 'this' refers to the document being validated
                return this.startDate <= value;
            },
            message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.'
        }
    }
}, { timestamps: true });

// Đảm bảo tính duy nhất cho tổ hợp tên kì và năm học
semesterSchema.index({ name: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);