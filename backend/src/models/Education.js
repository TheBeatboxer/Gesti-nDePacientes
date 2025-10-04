const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['pdf','video','link'], default: 'link' },
  url: String,
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Education', EducationSchema);
