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
    liked: [{ type: String }],
    comments: { type: String }
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, default: 'Mock Employee' },
    email: { type: String, default: 'employee@lumossolution.com' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema, 'office_event_guests');
