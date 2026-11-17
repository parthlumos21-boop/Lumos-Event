const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  codeId: {
    type: String,
    required: true,
    unique: true,
    default: 'lumos_public_event_form'
  },
  title: {
    type: String,
    default: 'Lumos Event Public Registration Form'
  },
  targetUrl: {
    type: String,
    required: true
  },
  qrDataUrl: {
    type: String,
    required: true
  },
  format: {
    type: String,
    default: 'PNG'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  metadata: {
    eventName: { type: String, default: 'Lumos Office Opening' },
    errorCorrectionLevel: { type: String, default: 'H' },
    margin: { type: Number, default: 2 },
    width: { type: Number, default: 1024 }
  },
  createdBy: {
    role: { type: String, default: 'admin' },
    email: { type: String, default: 'admin@lumossolution.com' }
  }
}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema, 'lumos_qr_codes');

