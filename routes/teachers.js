const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Faculty = require('../models/Faculty');
const Degree = require('../models/Degree');

router.get('/', async (req, res) => {
  try {
    res.json(await Teacher.find().populate('facultyId degreeId'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    res.json(await Teacher.create(req.body));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    res.json(await Teacher.findByIdAndDelete(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    res.json(await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Statistics
router.get('/stats/by-faculty', async (req, res) => {
  try {
    const result = await Teacher.aggregate([
      { $group: { _id: "$facultyId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'faculties',
          localField: '_id',
          foreignField: '_id',
          as: 'faculty'
        }
      },
      { $unwind: "$faculty" },
      { $project: { facultyName: "$faculty.fullName", count: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats/by-degree', async (req, res) => {
  try {
    const result = await Teacher.aggregate([
      { $group: { _id: "$degreeId", count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'degrees',
          localField: '_id',
          foreignField: '_id',
          as: 'degree'
        }
      },
      { $unwind: "$degree" },
      { $project: { degreeName: "$degree.fullName", count: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;