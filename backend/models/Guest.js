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

module.exports = mongoose.model('Guest', guestSchema, 'lumos_event');
