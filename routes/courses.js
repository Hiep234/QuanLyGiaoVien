const express = require('express');
const router = express.Router();
const Course = require('../models/Course'); // Đường dẫn tới model Course

// Middleware để lấy học phần theo ID
async function getCourse(req, res, next) {
    let course;
    try {
        course = await Course.findById(req.params.id);
        if (course == null) {
            return res.status(404).json({ message: 'Không tìm thấy học phần' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
    res.locals.course = course; // Sử dụng res.locals thay vì res.course để tránh ghi đè
    next();
}

// GET: Lấy tất cả học phần
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().sort({ code: 1 }); // Sắp xếp theo mã học phần
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
});

// POST: Tạo học phần mới
router.post('/', async (req, res) => {
    const { code, name, credits, coefficient, periods, description } = req.body;

    if (!code || !name || credits == null || periods == null) {
        return res.status(400).json({ message: 'Mã học phần, tên, số tín chỉ và số tiết là bắt buộc.' });
    }

    const course = new Course({
        code,
        name,
        credits,
        coefficient,
        periods,
        description
    });

    try {
        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (err) {
        // Xử lý lỗi trùng mã
        if (err.code === 11000 && err.keyPattern && err.keyPattern.code) {
            return res.status(400).json({ message: `Mã học phần '${code}' đã tồn tại.` });
        }
        res.status(400).json({ message: 'Lỗi khi tạo học phần: ' + err.message });
    }
});

// GET: Lấy một học phần theo ID
router.get('/:id', getCourse, (req, res) => {
    res.json(res.locals.course);
});

// PUT: Cập nhật học phần theo ID
router.put('/:id', getCourse, async (req, res) => {
    const { name, credits, coefficient, periods, description, code } = req.body;

    // Không cho phép thay đổi mã học phần qua PUT, trừ khi bạn có logic đặc biệt
    if (code && code !== res.locals.course.code) {
         return res.status(400).json({ message: 'Không thể thay đổi mã học phần. Hãy tạo mới nếu cần.' });
    }

    if (name != null) res.locals.course.name = name;
    if (credits != null) res.locals.course.credits = credits;
    if (coefficient != null) res.locals.course.coefficient = coefficient;
    if (periods != null) res.locals.course.periods = periods;
    if (description != null) res.locals.course.description = description;

    try {
        const updatedCourse = await res.locals.course.save();
        res.json(updatedCourse);
    } catch (err) {
        res.status(400).json({ message: 'Lỗi khi cập nhật học phần: ' + err.message });
    }
});

// DELETE: Xóa học phần theo ID
router.delete('/:id', getCourse, async (req, res) => {
    try {
        // Trước khi xóa, bạn có thể muốn kiểm tra xem học phần này có đang được sử dụng trong Lớp học phần nào không
        // Ví dụ: const classSections = await ClassSection.find({ course: res.locals.course._id });
        // if (classSections.length > 0) {
        //     return res.status(400).json({ message: 'Không thể xóa học phần đang được sử dụng trong các lớp học phần.' });
        // }
        await Course.deleteOne({ _id: req.params.id }); //Sử dụng Course.deleteOne
        res.json({ message: 'Đã xóa học phần thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi xóa học phần: ' + err.message });
    }
});

module.exports = router;