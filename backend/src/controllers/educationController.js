const Education = require('../models/Education');

exports.getAll = async (req, res) => {
  try {
    const items = await Education.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, type, url, tags } = req.body;
    const ed = new Education({
      title,
      type,
      url,
      tags,
      createdBy: req.user._id
    });
    await ed.save();
    res.json(ed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
