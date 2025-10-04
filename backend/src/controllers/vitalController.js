const Vital = require('../models/Vital');
const Alert = require('../models/Alert');

function checkRanges(type, value) {
  if (type === 'temp') {
    if (value > 38) return { level: 'high', msg: 'Fever (>38°C)' };
    if (value < 35) return { level: 'high', msg: 'Hypothermia (<35°C)' };
  }
  if (type === 'glucose') {
    if (value > 180) return { level: 'high', msg: 'Hyperglycemia (>180 mg/dL)' };
    if (value < 70) return { level: 'high', msg: 'Hypoglycemia (<70 mg/dL)' };
  }
  if (type === 'heartRate') {
    if (value > 120) return { level: 'high', msg: 'Tachycardia (>120 bpm)' };
    if (value < 40) return { level: 'high', msg: 'Bradycardia (<40 bpm)' };
  }
  if (type === 'pressure') {
    if (value.systolic >= 180 || value.diastolic >= 120) return { level: 'high', msg: 'Hypertensive crisis' };
    if (value.systolic >= 140 || value.diastolic >= 90) return { level: 'medium', msg: 'Hypertension' };
  }
  return null;
}

exports.addVital = async (req, res) => {
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

    const alertInfo = checkRanges(type, value);
    let alert;
    if (alertInfo) {
      alert = new Alert({
        patientId: req.params.patientId,
        vitalId: vital._id,
        level: alertInfo.level,
        message: alertInfo.msg
      });
      await alert.save();

      // emitir por socket
      const io = req.app.get('io');
      io.emit('newAlert', { alert });
    }

    res.json({ ok: true, vital, alert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
