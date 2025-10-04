const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const adminMiddleware = require('../middleware/admin');
const nurseMiddleware = require('../middleware/nurse');
const authMiddleware = require('../middleware/auth');

router.get('/', patientController.getPatients);
router.get('/me', authMiddleware, patientController.getPatientByUserId);
router.get('/:id', patientController.getPatientById);
router.post('/', nurseMiddleware, patientController.createPatient);
router.put('/:id', adminMiddleware, patientController.updatePatient);
router.delete('/:id', adminMiddleware, patientController.deletePatient);

router.post('/:id/history', nurseMiddleware, patientController.addHistoryNote);
router.post('/:id/assign-nurse', adminMiddleware, patientController.assignNurse);
router.post('/:id/unassign-nurse', adminMiddleware, patientController.unassignNurse);
router.get('/appointments/today', nurseMiddleware, patientController.getTodaysAppointments);

module.exports = router;
