const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/', auth, chatController.sendMessage);
router.get('/conversations/:userId', auth, chatController.getConversation);
router.get('/unread-count', auth, chatController.getUnreadCount);

module.exports = router;
