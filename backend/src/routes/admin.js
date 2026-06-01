const express = require('express');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Transaction = require('../models/Transaction');
const { Notifications } = require('../utils/notifications');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

const router = express.Router();

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
    const users = await User.findAll({
      where: { role: { [Op.in]: ['user', 'admin'] } },
      order: [['createdAt', 'DESC']]
    });
    return res.json({ users, count: users.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /admin/shipments ─────────────────────────────────────────────────────
router.get('/shipments', async (req, res) => {
  try {
    const shipments = await Shipment.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ shipments, count: shipments.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /admin/partners ──────────────────────────────────────────────────────
router.get('/partners', async (req, res) => {
  try {
    const partners = await User.findAll({
      where: { role: 'deliveryPartner' },
      order: [['createdAt', 'DESC']]
    });
    return res.json({ partners, count: partners.length });
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
      totalInquiries,
      totalVisitorLogs,
    ] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      User.count({ where: { role: 'deliveryPartner' } }),
      Shipment.count(),
      User.count({ where: { role: 'deliveryPartner', status: 'available' } }),
      Transaction.findAll({ attributes: ['platformFee', 'status'] }),
      Shipment.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
        group: ['status']
      }),
      sequelize.model('Inquiry').count(),
      sequelize.model('VisitorLog').count(),
    ]);

    const totalRevenue = transactions.reduce((s, t) => s + (t.platformFee || 0), 0);
    const completedOrders = transactions.filter(t => t.status === 'completed').length;

    const statusCounts = {};
    shipmentStatuses.forEach(s => { statusCounts[s.status] = parseInt(s.get('count')); });

    return res.json({
      totalUsers,
      totalPartners,
      totalShipments,
      activePartners,
      totalRevenue,
      completedOrders,
      statusCounts,
      totalInquiries,
      totalVisitorLogs,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /admin/assign-partner ──────────────────────────────────────────────
router.patch('/assign-partner', async (req, res) => {
  try {
    const { shipmentId, partnerId } = req.body;
    const shipment = await Shipment.findByPk(shipmentId);
    const partner = await User.findByPk(partnerId);

    if (!shipment || !partner) return res.status(404).json({ error: 'Not found' });

    shipment.deliveryPartnerId = partner.id;
    shipment.deliveryPartnerName = partner.name;
    shipment.status = 'PARTNER_ASSIGNED';
    
    const updatedTimeline = [...shipment.statusTimeline, {
      status: 'PARTNER_ASSIGNED',
      timestamp: new Date(),
      note: `Manually assigned by admin to ${partner.name}`,
    }];
    
    shipment.statusTimeline = updatedTimeline;
    shipment.changed('statusTimeline', true);
    
    await shipment.save();
    await User.update({ status: 'busy' }, { where: { id: partnerId } });

    Notifications.partnerAssigned(shipmentId, shipment.userEmail, partner.name);
    return res.json({ message: `Partner assigned` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
