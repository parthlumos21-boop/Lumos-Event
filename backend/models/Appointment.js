const mongoose = require('mongoose');

const LogActivitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    required: true,
    enum: [
      'Meeting Scheduled',
      'Follow-up Call',
      'Client Visit',
      'Email Communication',
      'Customer Interaction',
      'Remarks',
      'Other'
    ]
  },
  titleSummary: {
    type: String,
    required: true,
    trim: true
  },
  activityDateTime: {
    type: Date,
    default: Date.now
  },
  detailedNotes: {
    type: String,
    default: '',
    trim: true
  },
  createdByLog: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'employee' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const appointmentSchema = new mongoose.Schema({
  srNo: {
    type: String,
    required: true,
    unique: true
  },
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  reference: {
    type: String,
    enum: ['Architect', 'Interior Designer', 'Builder', 'Automation Consultant', 'Direct Client', 'Other'],
    default: 'Direct Client'
  },
  referenceName: {
    type: String,
    trim: true,
    default: ''
  },
  internalReference: {
    type: String,
    trim: true,
    default: ''
  },
  requirements: {
    type: String,
    trim: true,
    default: ''
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true,
    trim: true
  },
  remark: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Pending', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, default: 'Staff' },
    email: { type: String },
    role: { type: String, default: 'employee' }
  },
  updatedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    email: { type: String },
    role: { type: String }
  },
  logactivity: {
    type: [LogActivitySchema],
    default: []
  }
}, { timestamps: true });

// Compound and search indexes for fast lookup and sorting
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ contact: 1 });
appointmentSchema.index({ clientName: 'text', location: 'text', reference: 'text' });
appointmentSchema.index({ 'createdBy.userId': 1, createdAt: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema, 'lumos_appointments');
