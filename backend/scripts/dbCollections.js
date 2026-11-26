const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const COLLECTIONS = [
  'users',
  'lumos_event',
  'lumos_appointments',
  'lumos_qr_codes',
  'guest_activities',
  'guest_audit_logs',
  'appointment_activities',
  'appointment_audit_logs'
];

const SNAPSHOT_DIR = path.resolve(__dirname, '../data/snapshot');

const getMongoUri = () => process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LumosEvent';

module.exports = {
  COLLECTIONS,
  SNAPSHOT_DIR,
  getMongoUri
};
