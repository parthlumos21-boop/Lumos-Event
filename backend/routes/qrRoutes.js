const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

// Public & Authenticated: Fetch permanent QR code
router.get('/permanent', qrController.getPermanentQRCode);

// Admin-only: Update or re-sync permanent QR code
router.post('/permanent/sync', verifyToken, requireRole('admin'), qrController.syncPermanentQRCode);

module.exports = router;

