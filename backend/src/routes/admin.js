const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Transaction = require('../models/Transaction');
const { Notifications } = require('../utils/notifications');

const router = express.Router();

// ─── Admin guard (inline — no Firebase) ──────────────────────────────────────
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

router.use(authenticate, adminOnly);

// ─── GET /admin/users ─────────────────────────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['user', 'admin'] } })
      .sort({ createdAt: -1 }).select('-__v').lean();
    return res.json({ users: users.map(u => ({ ...u, id: u._id })), count: users.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /admin/shipments ─────────────────────────────────────────────────────
router.get('/shipments', async (req, res) => {
  try {
    const shipments = await Shipment.find().sort({ createdAt: -1 }).lean();
    return res.json({ shipments: shipments.map(s => ({ ...s, id: s._id })), count: shipments.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /admin/partners ──────────────────────────────────────────────────────
router.get('/partners', async (req, res) => {
  try {
    const partners = await User.find({ role: 'deliveryPartner' })
      .sort({ createdAt: -1 }).select('-__v').lean();
    return res.json({ partners: partners.map(p => ({ ...p, id: p._id })), count: partners.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /admin/analytics ─────────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const [
      totalUsers,
      totalPartners,
      totalShipments,
      activePartners,
      transactions,
      shipmentStatuses,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'deliveryPartner' }),
      Shipment.countDocuments(),
      User.countDocuments({ role: 'deliveryPartner', status: 'available' }),
      Transaction.find().select('platformFee status').lean(),
      Shipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const totalRevenue = transactions.reduce((s, t) => s + (t.platformFee || 0), 0);
    const completedOrders = transactions.filter(t => t.status === 'completed').length;

    const statusCounts = {};
    shipmentStatuses.forEach(s => { statusCounts[s._id] = s.count; });

    return res.json({
      totalUsers,
      totalPartners,
      totalShipments,
      activePartners,
      totalRevenue,
      completedOrders,
      statusCounts,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /admin/assign-partner ──────────────────────────────────────────────
router.patch('/assign-partner', async (req, res) => {
  try {
    const { shipmentId, partnerId } = req.body;
    if (!shipmentId || !partnerId) {
      return res.status(400).json({ error: 'shipmentId and partnerId required' });
    }

    const [shipment, partner] = await Promise.all([
      Shipment.findById(shipmentId),
      User.findById(partnerId),
    ]);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    if (!partner) return res.status(404).json({ error: 'Partner not found' });

    shipment.deliveryPartnerId = partner._id;
    shipment.deliveryPartnerName = partner.name;
    shipment.status = 'PARTNER_ASSIGNED';
    shipment.statusTimeline.push({
      status: 'PARTNER_ASSIGNED',
      timestamp: new Date(),
      note: `Manually assigned by admin to ${partner.name}`,
    });
    await shipment.save();
    await User.findByIdAndUpdate(partnerId, { status: 'busy' });

    Notifications.partnerAssigned(shipmentId, shipment.userEmail, partner.name);
    return res.json({ message: `Partner ${partner.name} assigned to shipment ${shipmentId}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /admin/users/:id/role ──────────────────────────────────────────────
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin', 'deliveryPartner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-__v' }
    ).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ message: `Role updated to ${role}`, user: { ...user, id: user._id } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
