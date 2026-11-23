const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'employee', 'user'],
      message: '{VALUE} is not a valid role. Allowed roles are: admin, employee, user'
    },
    default: 'employee',
    required: true
  },
  department: {
    type: String,
    default: 'General',
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  plainPassword: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'users');
