const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'lumos_event_jwt_super_secret_key_2026';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'lumos_event_refresh_super_secret_key_2026';

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: '365d' });

  return { accessToken, refreshToken };
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      logger.warn('AUTH LOGIN FAILED', `User '${cleanEmail}' not found in database.`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let isMatch = false;
    if (user.plainPassword && user.plainPassword === password) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, user.password).catch(() => false);
    }

    if (!isMatch) {
      logger.warn('AUTH LOGIN FAILED', `Incorrect password for user '${cleanEmail}'.`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Save session for persistent login
    await Session.create({
      userId: user._id,
      refreshToken,
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    logger.success('AUTH LOGIN SUCCESS', `User '${user.email}' logged in successfully as role: ${user.role}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      accessToken,
      refreshToken
    });
  } catch (err) {
    logger.error('AUTH LOGIN ERROR', err.message, err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const session = await Session.findOne({ refreshToken, isValid: true });
    if (!session) {
      logger.warn('AUTH REFRESH FAILED', 'Invalid or revoked refresh token provided.');
      return res.status(403).json({ message: 'Invalid or revoked refresh token' });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { accessToken } = generateTokens(user);
    logger.info('AUTH TOKEN REFRESHED', `Access token refreshed for '${user.email}'`);
    res.json({ accessToken });
  } catch (err) {
    logger.error('AUTH REFRESH ERROR', err.message, err);
    res.status(403).json({ message: 'Invalid refresh token', error: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await Session.deleteOne({ refreshToken });
    }
    logger.info('AUTH LOGOUT', `User session ended.`);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    logger.error('AUTH LOGOUT ERROR', err.message, err);
    res.status(500).json({ message: 'Error during logout', error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    let user = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).select('-password');
    }

    // Graceful fallback to email if the user document ID changed during DB reseed/migration
    if (!user && req.user?.email) {
      user = await User.findOne({ email: req.user.email.toLowerCase().trim() }).select('-password');
    }

    if (!user) {
      return res.status(401).json({ message: 'User session expired or user not found. Please log in again.' });
    }

    res.json({ user });
  } catch (err) {
    logger.error('AUTH ME ERROR', err.message, err);
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

exports.seedDefaultAdmin = async () => {
  try {
    const admin = await User.findOne({ email: 'admin@lumos.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'System Admin',
        email: 'admin@lumos.com',
        password: hashedPassword,
        plainPassword: 'admin123',
        role: 'admin',
        department: 'Administration'
      });
      logger.success('SEED', 'Default Admin seeded: admin@lumos.com / admin123');
    } else if (!admin.plainPassword) {
      admin.plainPassword = 'admin123';
      await admin.save();
      logger.info('SEED', 'Updated admin@lumos.com with plainPassword');
    }
  } catch (err) {
    logger.error('SEED ERROR', err.message, err);
  }
};
