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

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const current = req.user._id;
    const msgs = await Message.find({
      $or: [
        { from: current, to: userId },
        { from: userId, to: current }
      ]
    }).sort({ createdAt: 1 });

    res.json(msgs);
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
