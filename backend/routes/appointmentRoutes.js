const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
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

module.exports = router;
