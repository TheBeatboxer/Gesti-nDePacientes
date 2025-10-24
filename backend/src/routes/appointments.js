const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/auth');
const nurseMiddleware = require('../middleware/nurse');

// All routes require authentication
router.use(authMiddleware);

// Get appointments (filtered by role)
router.get('/', appointmentController.getAppointments);

// Get upcoming reminders
router.get('/reminders/upcoming', appointmentController.getUpcomingReminders);

// Get my appointments (for patients)
router.get('/my', appointmentController.getMyAppointments);

// Get specific appointment
router.get('/:id', appointmentController.getAppointmentById);

// Create appointment (nurses and admins)
router.post('/', nurseMiddleware, appointmentController.createAppointment);

// Update appointment
router.put('/:id', appointmentController.updateAppointment);

// Confirm appointment (patients can confirm their own)
router.put('/:id/confirm', appointmentController.confirmAppointment);

// Delete appointment
router.delete('/:id', nurseMiddleware, appointmentController.deleteAppointment);

module.exports = router;
