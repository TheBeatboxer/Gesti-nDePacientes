const express = require('express');
const router = express.Router();
const Education = require('../models/Education');

router.get('/', async (req, res) => {
  const items = await Education.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post('/', async (req, res) => {
  const { title, type, url, tags } = req.body;
  const ed = new Education({ title, type, url, tags, createdBy: req.user._id });
  await ed.save();
  res.json(ed);
});

module.exports = router;
