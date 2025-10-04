const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: { type: String }, // optional grouping id
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date, default: null }
});
module.exports = mongoose.model('Message', MessageSchema);
