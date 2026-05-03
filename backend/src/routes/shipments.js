const express = require('express');
const { authenticate } = require('../middleware/auth');
const Shipment = require('../models/Shipment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { compareCouriers } = require('../services/courierService');
const { findNearestPartner } = require('../utils/haversine');
const { Notifications } = require('../utils/notifications');

const router = express.Router();
const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '10');

const STATUS_FLOW = ['CREATED','PARTNER_ASSIGNED','PICKED_UP','HANDED_TO_COURIER','IN_TRANSIT','DELIVERED'];

// ─── POST /shipments ──────────────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { pickupAddress, pickupCoords, deliveryAddress, deliveryCoords,
            weight, dimensions, parcelType, selectedCourier } = req.body;

    if (!pickupAddress || !deliveryAddress || !weight || !selectedCourier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pCoords = pickupCoords   || { lat: 17.385, lng: 78.4867 };
    const dCoords = deliveryCoords || { lat: 19.076, lng: 72.8777 };

    const quotes = compareCouriers(parseFloat(weight), pCoords, dCoords);
    const chosen = quotes.find(c => c.courier === selectedCourier) || quotes[0];

    const platformFee = Math.round((chosen.price * PLATFORM_FEE_PERCENT) / 100);
    const totalAmount = chosen.price + platformFee;
    const now = new Date();

    const shipment = await Shipment.create({
      userId: req.user.userId,
      userEmail: req.user.email,
      pickupAddress,
      pickupCoords: pCoords,
      deliveryAddress,
      deliveryCoords: dCoords,
      weight: parseFloat(weight),
      dimensions: dimensions || {},
      parcelType: parcelType || 'General',
      courier: chosen,
      status: 'CREATED',
      statusTimeline: [{ status: 'CREATED', timestamp: now, note: 'Shipment created' }],
      platformFee,
      totalAmount,
    });

    // Store transaction
    await Transaction.create({
      shipmentId: shipment.id,
      userId: req.user.userId,
      courierPrice: chosen.price,
      platformFee,
      totalAmount,
      status: 'pending',
    });

    // Auto-assign nearest available partner
    const nearest = await findNearestPartner(User, pCoords);
    if (nearest) {
      shipment.status = 'PARTNER_ASSIGNED';
      shipment.deliveryPartnerId = nearest.id;
      shipment.deliveryPartnerName = nearest.data.name;
      
      const updatedTimeline = [...shipment.statusTimeline, {
        status: 'PARTNER_ASSIGNED',
        timestamp: new Date(),
        note: `Auto-assigned to ${nearest.data.name}`,
      }];
      shipment.statusTimeline = updatedTimeline;
      
      await shipment.save();
      await User.update({ status: 'busy' }, { where: { id: nearest.id } });
      
      Notifications.partnerAssigned(shipment.id, req.user.email, nearest.data.name);
    }

    Notifications.bookingConfirmed(shipment.id, req.user.email);
    return res.status(201).json({
      message: 'Shipment created',
      shipmentId: shipment.id,
      shipment,
    });
  } catch (err) {
    console.error('[POST /shipments]', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /shipments — My shipments ────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const shipments = await Shipment.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });
    return res.json({ shipments });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── GET /shipments/:id ───────────────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const uid = req.user.userId;
    const isOwner = shipment.userId === uid;
    const isPartner = shipment.deliveryPartnerId === uid;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isPartner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ shipment });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── PATCH /shipments/:id/status ──────────────────────────────────────────────
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!STATUS_FLOW.includes(status)) {
      return res.status(400).json({ error: `Invalid status` });
    }

    const shipment = await Shipment.findByPk(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    shipment.status = status;
    const updatedTimeline = [...shipment.statusTimeline, {
      status,
      timestamp: new Date(),
      note: note || `Updated to ${status}`,
      updatedBy: req.user.userId,
    }];
    shipment.statusTimeline = updatedTimeline;
    await shipment.save();

    if (status === 'DELIVERED' && shipment.deliveryPartnerId) {
      const earning = Math.round(shipment.platformFee * 0.6);
      await User.increment({ totalDeliveries: 1, totalEarnings: earning }, { where: { id: shipment.deliveryPartnerId } });
      await User.update({ status: 'available' }, { where: { id: shipment.deliveryPartnerId } });
      
      await Transaction.update(
        { status: 'completed', completedAt: new Date(), partnerEarning: earning },
        { where: { shipmentId: shipment.id } }
      );
    }

    Notifications.statusUpdate(req.params.id, shipment.userEmail, status);
    return res.json({ message: 'Status updated', status });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
