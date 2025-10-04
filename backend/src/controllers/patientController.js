const Patient = require('../models/Patient');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createPatient = async (req, res) => {
  try {
    const { name, dni, birthDate, contact, clinicalSummary, dischargeType, history, createCredentials, email, password } = req.body;
    let userId = null;
    let generatedPassword = null;

    if (createCredentials && email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already registered' });

      // Use provided password or generate a random one
      generatedPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(generatedPassword, salt);

      const user = new User({
        name,
        email,
        passwordHash: hash,
        roles: ['PATIENT']
      });
      await user.save();
      userId = user._id;
    }

    const patient = new Patient({
      name,
      dni,
      birthDate,
      contact,
      clinicalSummary,
      dischargeType,
      assignedNurses: req.user.roles.includes('NURSE') ? [req.user._id] : [],
      userId,
      history
    });
    await patient.save();
    res.json({ ok: true, patient, credentials: createCredentials ? { email, password: generatedPassword } : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const { assignedTo, search, page = 1, limit = 20 } = req.query;
    const q = {};
    if (assignedTo) q.assignedNurses = assignedTo;
    if (search) q.name = { $regex: search, $options: 'i' };

    // If user is NURSE, filter to only show patients assigned to them
    if (req.user.roles.includes('NURSE')) {
      q.assignedNurses = req.user._id;
    }

    const items = await Patient.find(q)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('assignedNurses', 'name email');
    const total = await Patient.countDocuments(q);

    res.json({ total, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedNurses', 'name email');
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedNurses', 'name email');
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addHistoryNote = async (req, res) => {
  try {
    const { note, nurseId } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    patient.history.push({ note, nurse: nurseId });
    await patient.save();
    res.json({ ok: true, patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignNurse = async (req, res) => {
  try {
    const { nurseId } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    if (!patient.assignedNurses.includes(nurseId)) {
      patient.assignedNurses.push(nurseId);
      await patient.save();
    }
    res.json({ ok: true, patient: await patient.populate('assignedNurses', 'name email') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unassignNurse = async (req, res) => {
  try {
    const { nurseId } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    patient.assignedNurses = patient.assignedNurses.filter(id => id.toString() !== nurseId);
    await patient.save();
    res.json({ ok: true, patient: await patient.populate('assignedNurses', 'name email') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTodaysAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const patients = await Patient.find({ assignedNurses: req.user._id });
    let count = 0;
    patients.forEach(p => {
      p.scheduledVisits.forEach(v => {
        if (v.date >= today && v.date < tomorrow) count++;
      });
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientByUserId = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate('assignedNurses', 'name email');
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
