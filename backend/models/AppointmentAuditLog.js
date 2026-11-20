const mongoose = require('mongoose');

const changeSchema = new mongoose.Schema({
  field: { type: String, required: true },
  fieldLabel: { type: String },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

const appointmentAuditLogSchema = new mongoose.Schema({
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },
  collectionName: {
    type: String,
    default: 'lumos_appointments'
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'RESTORE'],
    default: 'UPDATE',
    index: true
  },
  changedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, default: 'employee' }
  },
  changedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  changes: [changeSchema],
  remarks: {
    type: String,
    default: 'Updated via Appointment Profile'
  }
}, { timestamps: true });

appointmentAuditLogSchema.index({ recordId: 1, changedAt: -1 });

module.exports = mongoose.model('AppointmentAuditLog', appointmentAuditLogSchema, 'appointment_audit_logs');
