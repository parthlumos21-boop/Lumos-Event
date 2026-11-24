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

const FollowUpSchema = new mongoose.Schema({
  followUpId: {
    type: String,
    required: true,
    default: () => `flw_${new mongoose.Types.ObjectId().toString()}`
  },
  followUpDate: {
    type: Date,
    required: true
  },
  followUpTime: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    maxlength: 5000,
    default: '',
    trim: true
  },
  // Appointment Owner tracking: allows appointment owner to view and manage follow-ups
  appointmentOwner: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'employee' }
  },
  assignedTo: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    email: { type: String },
    role: { type: String, default: 'employee' }
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: true
    },
    reminderBefore: {
      type: Number,
      default: 15
    },
    reminderUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days'],
      default: 'minutes'
    },
    reminderAt: {
      type: Date
    },
    isSent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date
    },
    notifyRecipients: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: { type: String },
      name: { type: String },
      role: { type: String },
      isNotified: { type: Boolean, default: false },
      notifiedAt: { type: Date }
    }]
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled', 'Overdue'],
    default: 'Pending'
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'employee' }
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
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
    enum: ['Architect', 'Interior Designer', 'Builder', 'PMC/Automation Consultant', 'PMC/Automation Consultatnt', 'Walk-in Client', 'Other'],
    default: 'Walk-in Client'
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
  },
  followUps: {
    type: [FollowUpSchema],
    default: []
  }
}, { timestamps: true });

// Compound and search indexes for fast lookup and sorting (optimized for 50,000+ records)
appointmentSchema.index({ appointmentDate: 1, createdAt: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
appointmentSchema.index({ reference: 1, appointmentDate: 1 });
appointmentSchema.index({ contact: 1 });
appointmentSchema.index({ clientName: 'text', location: 'text', reference: 'text' });
appointmentSchema.index({ 'createdBy.userId': 1, appointmentDate: 1, createdAt: -1 });
appointmentSchema.index({ 'createdBy.userId': 1, createdAt: -1 });
appointmentSchema.index({
  'followUps.reminder.enabled': 1,
  'followUps.reminder.isSent': 1,
  'followUps.reminder.reminderAt': 1,
  'followUps.status': 1
});
appointmentSchema.index({ 'followUps.appointmentOwner.userId': 1, 'followUps.status': 1 });

module.exports = mongoose.model('Appointment', appointmentSchema, 'lumos_appointments');
