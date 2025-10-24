const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Alert = require('../models/Alert');

exports.createAppointment = async (req, res) => {
  try {
    const { patientId, nurseId, date, duration, type, notes, location, reminderTypes } = req.body;

    // Verify patient exists and nurse has access
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    // Check permissions
    if (req.user.roles.includes('NURSE') && !patient.assignedNurses.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized for this patient' });
    }

    const appointment = new Appointment({
      patientId,
      nurseId,
      date,
      duration,
      type,
      notes,
      location,
      createdBy: req.user._id
    });

    // Add reminders if specified
    if (reminderTypes && reminderTypes.length > 0) {
      const reminderDate = new Date(date);
      reminderDate.setHours(reminderDate.getHours() - 24); // 24 hours before

      appointment.reminders = reminderTypes.map(type => ({
        type,
        scheduledFor: reminderDate
      }));
    }

    await appointment.save();
    await appointment.populate(['patientId', 'nurseId', 'createdBy']);

    res.json({ ok: true, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { startDate, endDate, patientId, nurseId, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (patientId) query.patientId = patientId;
    if (nurseId) query.nurseId = nurseId;
    if (status) query.status = status;

    // Role-based filtering
    if (req.user.roles.includes('PATIENT')) {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) query.patientId = patient._id;
    } else if (req.user.roles.includes('NURSE')) {
      query.nurseId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name dni')
      .populate('nurseId', 'name email')
      .populate('createdBy', 'name')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(query);

    res.json({ total, appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name dni birthDate contact clinicalSummary')
      .populate('nurseId', 'name email')
      .populate('createdBy', 'name');

    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Check permissions
    if (req.user.roles.includes('PATIENT')) {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || patient._id.toString() !== appointment.patientId._id.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    } else if (req.user.roles.includes('NURSE') && appointment.nurseId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Check permissions
    if (req.user.roles.includes('NURSE') && appointment.nurseId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updates = req.body;
    updates.updatedAt = new Date();

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate(['patientId', 'nurseId', 'createdBy']);

    res.json({ ok: true, appointment: updatedAppointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Check permissions
    if (req.user.roles.includes('NURSE') && appointment.nurseId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const query = {
      'reminders.sent': false,
      'reminders.scheduledFor': { $lte: next24Hours }
    };

    // Role-based filtering
    if (req.user.roles.includes('PATIENT')) {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (patient) query.patientId = patient._id;
    } else if (req.user.roles.includes('NURSE')) {
      query.nurseId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name contact')
      .populate('nurseId', 'name');

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

    // Only patient can confirm their own appointments
    if (req.user.roles.includes('PATIENT')) {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || patient._id.toString() !== appointment.patientId.toString()) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }

    appointment.status = 'confirmada';
    appointment.updatedAt = new Date();
    await appointment.save();

    res.json({ ok: true, appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate('patientId', 'name dni')
      .populate('nurseId', 'name email')
      .populate('createdBy', 'name')
      .sort({ date: 1 });

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
