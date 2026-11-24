const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const followUpController = require('../controllers/appointmentFollowUpController');
const { verifyToken, optionalToken, requireRole } = require('../middleware/authMiddleware');

// Get next sequential Sr No preview
router.get('/next-sr-no', verifyToken, appointmentController.getNextSrNo);

// Get reference users (Active team members for appointment form reference selection)
router.get('/reference-users', verifyToken, appointmentController.getReferenceUsers);

// Batch delete appointments - Must be placed before /:id routes
router.delete('/batch', verifyToken, appointmentController.batchDeleteAppointments);

// List & Create
router.get('/', verifyToken, appointmentController.getAppointments);
router.post('/', verifyToken, appointmentController.createAppointment);

// High-performance appointment statistics and aggregates for 50,000+ records via MongoDB $facet pipeline
router.get('/stats', verifyToken, appointmentController.getAppointmentStats);

// Upcoming follow-up reminders for dashboard
router.get('/upcoming-reminders', verifyToken, followUpController.getUpcomingReminders);

// Single Appointment Read, Update & Delete
router.get('/:id', verifyToken, appointmentController.getAppointmentById);
router.put('/:id', verifyToken, appointmentController.updateAppointment);
router.delete('/:id', verifyToken, appointmentController.deleteAppointment);

// Audit history and business activities
router.get('/:id/audit-logs', verifyToken, appointmentController.getAppointmentAuditLogs);
router.get('/:id/activities', verifyToken, appointmentController.getAppointmentActivities);
router.post('/:id/activities', verifyToken, appointmentController.createAppointmentActivity);

// Embedded logactivity endpoints (lumos_appointments collection)
router.get('/:appointmentId/logactivity', verifyToken, appointmentController.getLogActivities);
router.post('/:appointmentId/logactivity', verifyToken, appointmentController.postLogActivity);

// Follow-up endpoints (embedded in lumos_appointments collection)
router.post('/:id/follow-ups', verifyToken, followUpController.createFollowUp);
router.get('/:id/follow-ups', verifyToken, followUpController.getFollowUps);
router.put('/:id/follow-ups/:followUpId', verifyToken, followUpController.updateFollowUp);
router.patch('/:id/follow-ups/:followUpId/status', verifyToken, followUpController.updateFollowUpStatus);
router.delete('/:id/follow-ups/:followUpId', verifyToken, followUpController.deleteFollowUp);

module.exports = router;
