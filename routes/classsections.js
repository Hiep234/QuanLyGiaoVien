const express = require('express');
const router = express.Router();
const ClassSection = require('../models/ClassSection');

// Lấy tất cả lớp học phần
router.get('/', async (req, res) => {
  try {
    const data = await ClassSection.find()
      .populate('courseId')
      .populate('semesterId');
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm mới
router.post('/', async (req, res) => {
  try {
    const newClass = await ClassSection.create(req.body);
    res.json(newClass);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cập nhật
router.put('/:id', async (req, res) => {
  try {
    const updated = await ClassSection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Xoá
router.delete('/:id', async (req, res) => {
  try {
    await ClassSection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xoá' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Thống kê
router.get('/statistics', async (req, res) => {
  try {
    const { year, semesterId, courseId } = req.query;
    
    let filter = {};
    if (semesterId) filter.semesterId = semesterId;
    if (courseId) filter.courseId = courseId;
    
    let classes = await ClassSection.find(filter)
      .populate('courseId')
      .populate('semesterId');
    
    // Filter by year if provided
    if (year) {
      classes = classes.filter(c => c.semesterId && c.semesterId.year == year);
    }
    
    const totalClasses = classes.length;
    const uniqueCourses = [...new Set(classes.map(c => c.courseId?._id?.toString()).filter(Boolean))];
    const totalCourses = uniqueCourses.length;
    const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);
    
    // Group by course for details
    const courseStats = {};
    classes.forEach(c => {
      const courseKey = c.courseId?._id?.toString();
      if (!courseKey) return;
      
      if (!courseStats[courseKey]) {
        courseStats[courseKey] = {
          courseName: c.courseId?.name || '',
          courseCode: c.courseId?.code || '',
          classCount: 0,
          totalStudents: 0,
          semesterName: c.semesterId?.name || '',
          year: c.semesterId?.year || ''
        };
      }
      
      courseStats[courseKey].classCount++;
      courseStats[courseKey].totalStudents += (c.studentCount || 0);
    });
    
    const details = Object.values(courseStats);
    
    // Create chart data
    const chartData = {
      labels: details.map(d => `${d.courseName} (${d.courseCode})`),
      data: details.map(d => d.classCount)
    };
    
    res.json({
      totalClasses,
      totalCourses,
      totalStudents,
      details,
      chartData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
