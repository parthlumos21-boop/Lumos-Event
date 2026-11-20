const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const guestRoutes = require('./guestRoutes');
const userRoutes = require('./userRoutes');
const qrRoutes = require('./qrRoutes');
const appointmentRoutes = require('./appointmentRoutes');

router.use('/auth', authRoutes);
router.use('/guests', guestRoutes);
router.use('/users', userRoutes);
router.use('/qr', qrRoutes);
router.use('/appointments', appointmentRoutes);

module.exports = router;
