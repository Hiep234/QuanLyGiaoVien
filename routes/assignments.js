const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');

// Lấy danh sách phân công
router.get('/', async (req, res) => {
  try {
    const data = await Assignment.find()
      .populate('teacherId')
      .populate({
        path: 'classSectionId',
        populate: ['courseId', 'semesterId']
      });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm mới
router.post('/', async (req, res) => {
  try {
    const newAssignment = await Assignment.create(req.body);
    res.json(newAssignment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật
router.put('/:id', async (req, res) => {
  try {
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xoá
router.delete('/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
