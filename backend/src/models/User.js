const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], default: ['PATIENT'] }, // e.g. NURSE, PATIENT, CAREGIVER, ADMIN
  shift: { type: String }, // added shift for nurses
  createdAt: { type: Date, default: Date.now }
});

// helper
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
