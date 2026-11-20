const mongoose = require('mongoose');

const appointmentActivitySchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: [
      'Meeting Scheduled',
      'Follow-up Call',
      'Client Visit',
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

appointmentActivitySchema.index({ appointmentId: 1, activityDate: -1 });

module.exports = mongoose.model('AppointmentActivity', appointmentActivitySchema, 'appointment_activities');
