const User = require('../models/User');
const logger = require('./logger');

/**
 * Resolves a human-readable English language password for a user record.
 * Guarantees zero $2b$ / $2a$ cryptographic hashcodes are ever returned.
 *
 * @param {Object} user - User document or lean object
 * @returns {string} Readable English password
 */
exports.resolveReadablePassword = (user) => {
  if (!user) return '';

  // 1. If explicit plainPassword exists and is non-empty, use it
  if (user.plainPassword && typeof user.plainPassword === 'string' && user.plainPassword.trim().length > 0) {
    return user.plainPassword.trim();
  }

  // 2. If user.password is stored in plaintext (does not start with $2)
  if (user.password && typeof user.password === 'string' && !user.password.startsWith('$2')) {
    return user.password.trim();
  }

  // 3. Known default seeds
  if (user.email === 'admin@lumos.com') {
    return 'admin123';
  }

  // 4. Generate clean, predictable English fallback: firstName@123
  const rawName = user.name || 'staff';
  const firstName = rawName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${firstName || 'staff'}@123`;
};

/**
 * High-performance O(N) startup database migration using MongoDB bulkWrite.
 * Updates all existing database records missing plainPassword in 1 single round-trip.
 */
exports.backfillUserPasswords = async () => {
  try {
    const usersNeedingUpdate = await User.find({
      $or: [
        { plainPassword: { $exists: false } },
        { plainPassword: null },
        { plainPassword: '' }
      ]
    }).select('_id email name password').lean();

    if (!usersNeedingUpdate || usersNeedingUpdate.length === 0) {
      return;
    }

    const bulkOps = usersNeedingUpdate.map((u) => {
      let readable = 'admin123';
      if (u.email !== 'admin@lumos.com') {
        const rawName = u.name || 'staff';
        const firstName = rawName.trim().split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        readable = `${firstName || 'staff'}@123`;
      }

      return {
        updateOne: {
          filter: { _id: u._id },
          update: { $set: { plainPassword: readable } }
        }
      };
    });

    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
      logger.info('DATABASE MIGRATION', `Efficiently updated ${bulkOps.length} user password(s) to readable format via bulkWrite.`);
    }
  } catch (err) {
    logger.error('DATABASE MIGRATION ERROR', `Failed to backfill user passwords: ${err.message}`, err);
  }
};
