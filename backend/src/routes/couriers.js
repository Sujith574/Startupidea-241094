const express = require('express');
const { compareCouriers } = require('../services/courierService');
const router = express.Router();

// POST /couriers/compare — public endpoint
router.post('/compare', (req, res) => {
  try {
    const { weight, pickupCoords, deliveryCoords } = req.body;
    if (!weight) return res.status(400).json({ error: 'weight is required' });
    const quotes = compareCouriers(
      parseFloat(weight),
      pickupCoords  || { lat: 17.385, lng: 78.4867 },
      deliveryCoords || { lat: 19.076, lng: 72.8777 }
    );
    return res.json({ quotes });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
