const express = require('express');
const { authenticate } = require('../middleware/auth');
const Shipment = require('../models/Shipment');
const User = require('../models/User');

const router = express.Router();
const STATUS_OPTIONS = ['PICKED_UP','HANDED_TO_COURIER','IN_TRANSIT','DELIVERED'];

// ─── GET /partners/jobs ───────────────────────────────────────────────────────
router.get('/jobs', authenticate, async (req, res) => {
  try {
    const jobs = await Shipment.find({ deliveryPartnerId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ jobs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /partners/jobs/:id ─────────────────────────────────────────────────
router.patch('/jobs/:id', authenticate, async (req, res) => {
  try {
    const { action, status, note } = req.body;
    const uid = req.user.userId;

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Job not found' });
    if (shipment.deliveryPartnerId?.toString() !== uid) {
      return res.status(403).json({ error: 'This job is not assigned to you' });
    }

    const now = new Date();

    if (action === 'reject') {
      shipment.deliveryPartnerId = null;
      shipment.deliveryPartnerName = null;
      shipment.status = 'CREATED';
      shipment.statusTimeline.push({ status: 'CREATED', timestamp: now, note: 'Partner rejected — re-queued' });
      await shipment.save();
      await User.findByIdAndUpdate(uid, { status: 'available' });
      return res.json({ message: 'Job rejected and re-queued' });
    }

    if (action === 'accept') {
      shipment.statusTimeline.push({ status: 'PARTNER_ASSIGNED', timestamp: now, note: 'Partner accepted', updatedBy: uid });
      await shipment.save();
      return res.json({ message: 'Job accepted' });
    }

    if (status && STATUS_OPTIONS.includes(status)) {
      shipment.status = status;
      shipment.statusTimeline.push({ status, timestamp: now, note: note || `Updated to ${status}`, updatedBy: uid });
      await shipment.save();

      if (status === 'DELIVERED') {
        const earning = Math.round((shipment.platformFee || 20) * 0.6);
        await User.findByIdAndUpdate(uid, {
          $inc: { totalDeliveries: 1, totalEarnings: earning },
          status: 'available',
        });
      }
      return res.json({ message: `Status updated to ${status}` });
    }

    return res.status(400).json({ error: 'Provide valid action or status' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /partners/earnings ────────────────────────────────────────────────────
router.get('/earnings', authenticate, async (req, res) => {
  try {
    const partner = await User.findById(req.user.userId)
      .select('totalDeliveries totalEarnings status')
      .lean();
    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    return res.json({
      totalDeliveries: partner.totalDeliveries || 0,
      totalEarnings: partner.totalEarnings || 0,
      status: partner.status,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /partners/location ─────────────────────────────────────────────────
router.patch('/location', authenticate, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    await User.findByIdAndUpdate(req.user.userId, {
      currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) },
    });
    return res.json({ message: 'Location updated' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
