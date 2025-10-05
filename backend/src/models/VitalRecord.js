const mongoose = require('mongoose');

const VitalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordedAt: { type: Date, default: Date.now },
  notes: { type: String }
});

module.exports = mongoose.model('VitalRecord', VitalRecordSchema);
