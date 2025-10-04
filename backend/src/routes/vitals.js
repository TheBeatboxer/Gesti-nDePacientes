const express = require('express');
const router = express.Router();
const Vital = require('../models/Vital');
const Alert = require('../models/Alert');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/auth');

function checkRanges(type, value) {
  // very simple checks — tune in production
  if (type === 'temp') {
    if (value > 38) return { level: 'high', msg: 'Fever (>38°C)' };
    if (value < 35) return { level: 'high', msg: 'Hypothermia (<35°C)' };
  }
  if (type === 'glucose') {
    if (value > 180) return { level: 'high', msg: 'Hiperglucemia (>180 mg/dL)' };
    if (value < 70) return { level: 'high', msg: 'Hipoglucemia (<70 mg/dL)' };
  }
  if (type === 'heartRate') {
    if (value > 120) return { level: 'high', msg: 'Taquicardia (>120 bpm)' };
    if (value < 40) return { level: 'high', msg: 'Bradicardia (<40 bpm)' };
  }
  if (type === 'pressure') {
    // value expected {systolic, diastolic}
    if (value.systolic >= 180 || value.diastolic >= 120) return { level: 'high', msg: 'Crisis hipertensiva' };
    if (value.systolic >= 140 || value.diastolic >= 90) return { level: 'medium', msg: 'Hipertensión' };
  }
  return null;
}

router.post('/:patientId', async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    const vital = new Vital({
      patientId: req.params.patientId,
      type,
      value,
      unit,
      recordedBy: req.user._id,
      notes
    });
    await vital.save();
    // check ranges
    const alertInfo = checkRanges(type, value);
    let alert;
    if (alertInfo) {
      alert = new Alert({
        patientId: req.params.patientId,
        vitalId: vital._id,
        level: alertInfo.level,
        message: alertInfo.msg,
        status: 'open'
      });
      await alert.save();
      // emit socket notification
      const io = req.app.get('io');
      // find assigned nurses? Simple: emit to all nurses - optimize later
      io.emit('newAlert', { alert });
    }
    res.json({ ok: true, vital, alert });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/self', authMiddleware, async (req, res) => {
  try {
    const { type, value, unit, notes } = req.body;
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const vital = new Vital({
      patientId: patient._id,
      type,
      value,
      unit,
      recordedBy: req.user._id,
      notes
    });
    await vital.save();
    // check ranges
    const alertInfo = checkRanges(type, value);
    let alert;
    if (alertInfo) {
      alert = new Alert({
        patientId: patient._id,
        vitalId: vital._id,
        level: alertInfo.level,
        message: alertInfo.msg,
        status: 'open'
      });
      await alert.save();
      // emit socket notification
      const io = req.app.get('io');
      io.emit('newAlert', { alert });
    }
    res.json({ ok: true, vital, alert });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/', async (req, res) => {
  try {
    const { patientId, type, startDate, endDate } = req.query;
    const q = {};
    if (patientId) q.patientId = patientId;
    if (type) q.type = type;
    if (startDate || endDate) {
      q.recordedAt = {};
      if (startDate) q.recordedAt.$gte = new Date(startDate);
      if (endDate) q.recordedAt.$lte = new Date(endDate);
    }
    const vitals = await Vital.find(q).sort({ recordedAt: -1 }).populate('recordedBy', 'name');
    res.json(vitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
