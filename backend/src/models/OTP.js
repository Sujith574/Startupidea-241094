const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['login', 'register'],
    default: 'login',
  },
  attempts: { type: Number, default: 0 },
  expiresAt: {
    type: Date,
    required: true,
    // Automatically deleted by MongoDB TTL index
    index: { expires: 0 },
  },
});

module.exports = mongoose.model('OTP', otpSchema);
