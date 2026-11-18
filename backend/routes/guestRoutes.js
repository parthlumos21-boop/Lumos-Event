const express = require('express');
const router = express.Router();
const guestController = require('../controllers/guestController');
const { verifyToken, optionalToken, requireRole } = require('../middleware/authMiddleware');

// Public & Authenticated guest submission
router.post('/', optionalToken, guestController.createGuest);

// Authenticated guest listings & statistics
router.get('/', verifyToken, guestController.getAllGuests);
router.get('/stats', verifyToken, guestController.getGuestStats);

// Batch delete guests (Admin strictly required) - Must be before /:id routes
router.delete('/batch', verifyToken, requireRole('admin'), guestController.deleteBatchGuests);

// Single Guest Profile, Audit Logs & Business Activities
router.get('/:id', verifyToken, guestController.getGuestById);
router.put('/:id', verifyToken, guestController.updateGuest);
router.put('/:id/staff-rating', verifyToken, guestController.updateStaffRating);
router.delete('/:id', verifyToken, requireRole('admin'), guestController.deleteGuest);

router.get('/:id/audit-logs', verifyToken, guestController.getGuestAuditLogs);
router.get('/:id/activities', verifyToken, guestController.getGuestActivities);
router.post('/:id/activities', verifyToken, guestController.createGuestActivity);

module.exports = router;
