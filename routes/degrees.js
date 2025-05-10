const express = require('express');
const router = express.Router();
const Degree = require('../models/Degree');

router.get('/', async (req, res) => {
  try {
    res.json(await Degree.find());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    res.json(await Degree.create(req.body));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    res.json(await Degree.findByIdAndDelete(req.params.id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    res.json(await Degree.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
