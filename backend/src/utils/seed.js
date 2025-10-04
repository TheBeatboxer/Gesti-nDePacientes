require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');

async function main() {
  await connectDB();
  // create admin
  const pwd = 'Admin123!';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(pwd, salt);

  let admin = await User.findOne({ email: 'admin@local.com' });
  if (!admin) {
    admin = new User({ name: 'Admin', email: 'admin@local.com', passwordHash: hash, roles: ['ADMIN'] });
    await admin.save();
    console.log('admin created -> email: admin@local.com password:', pwd);
  } else {
    console.log('admin exists');
  }

  // nurse
  let nurse = await User.findOne({ email: 'nurse@local.com' });
  if (!nurse) {
    nurse = new User({ name: 'Nurse One', email: 'nurse@local.com', passwordHash: hash, roles: ['NURSE'] });
    await nurse.save();
    console.log('nurse created -> nurse@local.com /', pwd);
  }

  // patient
  let patient = await Patient.findOne({ name: 'Paciente Demo' });
  if (!patient) {
    patient = new Patient({
      name: 'Paciente Demo',
      dni: '00000000',
      contact: { phone: '999999999', address: 'Calle Demo 123' },
      clinicalSummary: 'Alta postoperatoria'
    });
    patient.assignedNurses = [nurse._id];
    await patient.save();
    console.log('patient created');
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
