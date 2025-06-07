const express = require('express');
const router = express.Router();
const Semester = require('../models/Semester');

// Middleware để lấy kì học theo ID
async function getSemester(req, res, next) {
    let semester;
    try {
        semester = await Semester.findById(req.params.id);
        if (semester == null) {
            return res.status(404).json({ message: 'Không tìm thấy kì học' });
        }
    } catch (err) {
        return res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
    res.locals.semester = semester;
    next();
}

// GET: Lấy tất cả các kì học
router.get('/', async (req, res) => {
    try {
        const semesters = await Semester.find().sort({ startDate: -1 }); // Sắp xếp theo ngày bắt đầu giảm dần
        res.json(semesters);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server: ' + err.message });
    }
});

// POST: Tạo một kì học mới
router.post('/', async (req, res) => {
    const { name, year, startDate, endDate } = req.body;

    if (!name || !year || !startDate || !endDate) {
        return res.status(400).json({ message: 'Tên kì, năm học, ngày bắt đầu và ngày kết thúc là bắt buộc.' });
    }

    const semester = new Semester({
        name,
        year,
        startDate,
        endDate
    });

    try {
        const newSemester = await semester.save();
        res.status(201).json(newSemester);
    } catch (err) {
        if (err.code === 11000) { // Lỗi trùng lặp unique index
             return res.status(400).json({ message: `Kì học '${name} - ${year}' đã tồn tại.` });
        }
        res.status(400).json({ message: 'Lỗi khi tạo kì học: ' + err.message });
    }
});

// GET: Lấy một kì học theo ID
router.get('/:id', getSemester, (req, res) => {
    res.json(res.locals.semester);
});

// PUT: Cập nhật một kì học
router.put('/:id', getSemester, async (req, res) => {
    const { name, year, startDate, endDate } = req.body;

    if (name != null) res.locals.semester.name = name;
    if (year != null) res.locals.semester.year = year;
    if (startDate != null) res.locals.semester.startDate = startDate;
    if (endDate != null) res.locals.semester.endDate = endDate;

    try {
        const updatedSemester = await res.locals.semester.save();
        res.json(updatedSemester);
    } catch (err) {
        if (err.code === 11000) {
             return res.status(400).json({ message: `Kì học '${name} - ${year}' đã tồn tại.` });
        }
        res.status(400).json({ message: 'Lỗi khi cập nhật kì học: ' + err.message });
    }
});

// DELETE: Xóa một kì học
router.delete('/:id', getSemester, async (req, res) => {
    try {
        // Kiểm tra xem kì học có đang được sử dụng trong Lớp học phần nào không
        // const classSections = await ClassSection.find({ semester: res.locals.semester._id });
        // if (classSections.length > 0) {
        //     return res.status(400).json({ message: 'Không thể xóa kì học đang được sử dụng trong các lớp học phần.' });
        // }
        await Semester.deleteOne({ _id: req.params.id });
        res.json({ message: 'Đã xóa kì học thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi xóa kì học: ' + err.message });
    }
});

module.exports = router;