const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  vitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vital' },
  level: { type: String, enum: ['high','medium','low'], default: 'low' },
  message: String,
  status: { type: String, enum: ['open','in_progress','closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now },
  handledBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
module.exports = mongoose.model('Alert', AlertSchema);
