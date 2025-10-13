const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { to, text, conversationId } = req.body;
    const msg = new Message({
      conversationId,
      from: req.user._id,
      to,
      text
    });
    await msg.save();

    req.app.get('io').to(String(to)).emit('newMessage', { message: msg });

    res.json({ ok: true, message: msg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getChatHistory = async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;
    const conversationId = [user1Id, user2Id].sort().join('_');
    
    const messages = await Message.find({
      conversationId: conversationId
    }).sort({ createdAt: 'asc' });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ to: req.user._id, readAt: null });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
