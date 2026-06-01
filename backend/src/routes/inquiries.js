const express = require('express');
const Inquiry = require('../models/Inquiry');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Helper to enforce admin only
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ─── POST /inquiries (Public) ──────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, phone, fromCity, toCity, serviceType } = req.body;
    if (!name || !phone || !fromCity || !toCity) {
      return res.status(400).json({ error: 'Please provide name, phone, moving from, and moving to cities.' });
    }
    const inquiry = await Inquiry.create({
      name,
      phone,
      fromCity,
      toCity,
      serviceType: serviceType || 'Domestic Moving',
    });
    return res.status(201).json({ message: 'Inquiry submitted successfully!', inquiry });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /inquiries (Admin Only) ────────────────────────────────────────────────
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ inquiries, count: inquiries.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /inquiries/:id (Admin Only) ──────────────────────────────────────────
router.patch('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    inquiry.status = status;
    await inquiry.save();
    return res.json({ message: 'Inquiry status updated successfully', inquiry });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
