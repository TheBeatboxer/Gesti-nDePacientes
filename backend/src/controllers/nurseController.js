const User = require('../models/User');

exports.createNurse = async (req, res) => {
  try {
    const { name, email, password, shift } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const nurse = new User({
      name,
      email,
      passwordHash: hash,
      roles: ['NURSE'],
      shift
    });
    await nurse.save();

    res.json({ ok: true, nurse: { id: nurse._id, name: nurse.name, email: nurse.email, roles: nurse.roles, shift: nurse.shift } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNurses = async (req, res) => {
  try {
    const nurses = await User.find({ roles: { $in: ['NURSE'] } }).select('name email roles shift createdAt');
    res.json(nurses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNurseById = async (req, res) => {
  try {
    const nurse = await User.findOne({ _id: req.params.id, roles: { $in: ['NURSE'] } }).select('name email roles shift createdAt');
    if (!nurse) return res.status(404).json({ error: 'Not found' });
    res.json(nurse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNurse = async (req, res) => {
  try {
    const { name, email, shift } = req.body;
    const nurse = await User.findOneAndUpdate(
      { _id: req.params.id, roles: { $in: ['NURSE'] } },
      { name, email, shift },
      { new: true }
    ).select('name email roles shift createdAt');
    if (!nurse) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, nurse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNurse = async (req, res) => {
  try {
    const nurse = await User.findOneAndDelete({ _id: req.params.id, roles: { $in: ['NURSE'] } });
    if (!nurse) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
