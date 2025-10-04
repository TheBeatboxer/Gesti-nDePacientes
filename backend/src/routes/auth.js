const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already' });
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, passwordHash: hash, roles: [role || 'PATIENT'] });
    await user.save();
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user._id, name: user.name, roles: user.roles } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
