const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refreshToken: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema, 'sessions');
