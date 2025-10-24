const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, default: 30 }, // minutes
  type: { type: String, enum: ['consulta', 'control', 'procedimiento', 'visita_domiciliaria'], default: 'consulta' },
  status: { type: String, enum: ['programada', 'confirmada', 'completada', 'cancelada', 'no_asistio'], default: 'programada' },
  notes: String,
  location: String, // hospital, domicilio, etc.
  reminders: [{
    type: { type: String, enum: ['email', 'sms', 'in_app'], default: 'in_app' },
    scheduledFor: { type: Date },
    sent: { type: Boolean, default: false },
    sentAt: Date
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
AppointmentSchema.index({ patientId: 1, date: 1 });
AppointmentSchema.index({ nurseId: 1, date: 1 });
AppointmentSchema.index({ date: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
