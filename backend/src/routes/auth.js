const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
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
// Step 1: User enters email → receive OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Throttle: max 3 OTPs per 10 minutes (check existing unexpired OTP attempts)
    const recentOTP = await OTP.findOne({ email: normalizedEmail });
    if (recentOTP && recentOTP.attempts >= 3) {
      return res.status(429).json({
        error: 'Too many OTP requests. Please wait 10 minutes before trying again.',
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

    // Upsert: delete old OTP, create fresh
    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      purpose: 'login',
      attempts: 0,
    });

    // Check if user exists (new vs returning)
    const existingUser = await User.findOne({ email: normalizedEmail });
    const isNewUser = !existingUser;

    // Send OTP email
    await sendOTPEmail(normalizedEmail, otp, OTP_EXPIRES_MIN);

    return res.json({
      message: `OTP sent to ${normalizedEmail}`,
      isNewUser,
      expiresIn: OTP_EXPIRES_MIN * 60, // seconds
    });
  } catch (err) {
    console.error('[send-otp]', err);
    return res.status(500).json({ error: 'Failed to send OTP: ' + err.message });
  }
});

// ─── POST /auth/verify-otp ─────────────────────────────────────────────────────
// Step 2: Verify OTP → get JWT
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, name, phone, role, vehicleType, licenseNumber } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP not found or expired. Request a new one.' });
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteMany({ email: normalizedEmail });
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

    // OTP valid — delete it
    await OTP.deleteMany({ email: normalizedEmail });

    // Find or create user
    let user = await User.findOne({ email: normalizedEmail });
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
      // Update profile if provided
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.isProfileComplete = true;
      await user.save();
    }

    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });

    return res.json({
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      token,
      isNewUser,
      user: {
        id: user._id,
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
    const user = await User.findById(req.user.userId).select('-__v').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: { ...user, id: user._id } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /auth/profile ──────────────────────────────────────────────────────
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address, vehicleType, licenseNumber, currentLocation } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (vehicleType) updates.vehicleType = vehicleType;
    if (licenseNumber) updates.licenseNumber = licenseNumber;
    if (currentLocation) updates.currentLocation = currentLocation;
    updates.isProfileComplete = true;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, select: '-__v' }
    ).lean();

    return res.json({ message: 'Profile updated', user: { ...user, id: user._id } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
    return res.json({ token, user: { ...user, id: user._id } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
