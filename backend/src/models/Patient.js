const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dni: { type: String },
  birthDate: { type: Date },
  contact: {
    phone: String,
    address: String
  },
  clinicalSummary: { type: String },
  dischargeType: { type: String, enum: ['post-operatorio', 'crónico compensado', 'rehabilitación'], required: true },
  assignedNurses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link to User for login credentials
  history: [{
    date: { type: Date, default: Date.now },
    note: { type: String, required: true },
    nurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  scheduledVisits: [{
    date: { type: Date, required: true },
    type: { type: String, enum: ['visit', 'call', 'appointment'], default: 'visit' },
    note: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);
