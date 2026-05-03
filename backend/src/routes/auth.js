const express = require('express');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { signToken, authenticate } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/notifications');

const router = express.Router();

const OTP_EXPIRES_MIN = parseInt(process.env.OTP_EXPIRES_MIN || '10');

// ─── Helper: generate 6-digit OTP ─────────────────────────────────────────────
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// ─── POST /auth/send-otp ───────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Throttle check
    const recentOTP = await OTP.findOne({ where: { email: normalizedEmail } });
    if (recentOTP && recentOTP.attempts >= 3) {
      return res.status(429).json({
        error: 'Too many OTP requests. Please wait 10 minutes before trying again.',
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

    // Delete old and create fresh
    await OTP.destroy({ where: { email: normalizedEmail } });
    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      purpose: 'login',
      attempts: 0,
    });

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    const isNewUser = !existingUser;

    await sendOTPEmail(normalizedEmail, otp, OTP_EXPIRES_MIN);

    return res.json({
      message: `OTP sent to ${normalizedEmail}`,
      isNewUser,
      expiresIn: OTP_EXPIRES_MIN * 60,
    });
  } catch (err) {
    console.error('[send-otp]', err);
    return res.status(500).json({ error: 'Failed to send OTP: ' + err.message });
  }
});

// ─── POST /auth/verify-otp ─────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, name, phone, role, vehicleType, licenseNumber } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({ where: { email: normalizedEmail } });
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP not found or expired. Request a new one.' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.destroy({ where: { email: normalizedEmail } });
      return res.status(400).json({ error: 'OTP has expired. Request a new one.' });
    }

    if (otpRecord.otp !== otp.trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 3 - otpRecord.attempts;
      return res.status(400).json({
        error: `Invalid OTP. ${remaining > 0 ? `${remaining} attempts remaining.` : 'No attempts left. Request a new OTP.'}`,
      });
    }

    await OTP.destroy({ where: { email: normalizedEmail } });

    let user = await User.findOne({ where: { email: normalizedEmail } });
    const isNewUser = !user;

    if (isNewUser) {
      const userRole = ['user', 'deliveryPartner'].includes(role) ? role : 'user';
      user = await User.create({
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        phone: phone || '',
        role: userRole,
        vehicleType: userRole === 'deliveryPartner' ? (vehicleType || 'bike') : '',
        licenseNumber: userRole === 'deliveryPartner' ? (licenseNumber || '') : '',
        status: 'available',
        isProfileComplete: !!(name && phone),
      });
    } else if (name && !user.isProfileComplete) {
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.isProfileComplete = true;
      await user.save();
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });

    return res.json({
      token,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (err) {
    console.error('[verify-otp]', err);
    return res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
});

// ─── GET /auth/me ──────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /auth/profile ──────────────────────────────────────────────────────
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address, vehicleType, licenseNumber, currentLocation } = req.body;
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (vehicleType) user.vehicleType = vehicleType;
    if (licenseNumber) user.licenseNumber = licenseNumber;
    if (currentLocation) {
      user.lat = currentLocation.lat;
      user.lng = currentLocation.lng;
    }
    user.isProfileComplete = true;
    await user.save();

    return res.json({ message: 'Profile updated', user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
