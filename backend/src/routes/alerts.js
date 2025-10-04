const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const auth = require('../middleware/auth');
const nurse = require('../middleware/nurse');

router.get('/', auth, alertController.getAlerts);
router.post('/:id/ack', auth, nurse, alertController.ackAlert);
router.patch('/:id/resolve', auth, nurse, alertController.resolveAlert);
router.get('/active-patients-count', auth, nurse, alertController.getActiveAlertsPatientCount);

module.exports = router;
