const mongoose = require('mongoose');

const VitalSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  type: { type: String, required: true }, // pressure, heartRate, temp, glucose
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  unit: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordedAt: { type: Date, default: Date.now },
  notes: { type: String }
});
module.exports = mongoose.model('Vital', VitalSchema);
