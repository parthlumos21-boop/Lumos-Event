const mongoose = require('mongoose');

const guestActivitySchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: [
      'Guest Visit',
      'Follow-up Call',
      'Meeting Scheduled',
      'Email Communication',
      'Customer Interaction',
      'Remarks',
      'Other'
    ],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  activityDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'employee' }
  }
}, { timestamps: true });

guestActivitySchema.index({ guestId: 1, activityDate: -1 });

module.exports = mongoose.model('GuestActivity', guestActivitySchema, 'guest_activities');
