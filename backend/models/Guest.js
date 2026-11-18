const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  event: {
    type: { type: String, default: 'office_opening' },
    name: { type: String, default: 'Lumos Office Opening' },
    eventDate: { type: Date, default: Date.now }
  },
  guest: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    company: { type: String }
  },
  relationship: { type: String, required: true },
  interests: [{ type: String }],
  followUp: {
    required: { type: Boolean, default: false },
    preferredMethod: { type: String }
  },
  feedback: {
    rating: { type: Number },
    staffRating: { type: Number, default: 0 },
    feedbackType: { type: String, default: 'staff-rating' },
    'feedback-type': { type: String, default: 'staff-rating' },
    liked: [{ type: String }],
    comments: { type: String }
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Admin' },
    email: { type: String, default: 'admin@lumossolution.com' },
    role: { type: String, default: 'admin' }
  },
  updatedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    email: { type: String },
    role: { type: String }
  }
}, { timestamps: true });

// Compound and multikey indexes for 500,000+ record scale
guestSchema.index({ 'createdBy.userId': 1, createdAt: -1 });
guestSchema.index({ 'createdBy.email': 1, createdAt: -1 });
guestSchema.index({ relationship: 1 });
guestSchema.index({ interests: 1 });
guestSchema.index({ createdAt: -1 });
guestSchema.index({ 'feedback.rating': 1 });
guestSchema.index({ 'followUp.required': 1 });
guestSchema.index({ 'guest.phone': 1 });

module.exports = mongoose.model('Guest', guestSchema, 'lumos_event');
