const { haversineDistance } = require('../utils/haversine');
const { v4: uuidv4 } = require('uuid');

// ─── Shared Utilities ─────────────────────────────────────────────────────────
function generateTrackingId(prefix) {
  return `${prefix}-${uuidv4().split('-')[0].toUpperCase()}`;
}

function getDistanceKm(pickup, delivery) {
  return haversineDistance(pickup.lat, pickup.lng, delivery.lat, delivery.lng);
}

// ─── Base Rate Card ──────────────────────────────────────────────────────────
const RATE_CARDS = {
  delhivery: { basePrice: 40, perKg: 8, perKm: 0.5, currency: '₹' },
  bluedart:  { basePrice: 60, perKg: 12, perKm: 0.8, currency: '₹' },
  ekart:     { basePrice: 30, perKg: 6,  perKm: 0.4, currency: '₹' },
};

// ─── Delhivery Mock ──────────────────────────────────────────────────────────
function delhivery(weight, pickup, delivery) {
  const dist = getDistanceKm(pickup, delivery);
  const rc = RATE_CARDS.delhivery;
  const price = Math.round(rc.basePrice + weight * rc.perKg + dist * rc.perKm);
  const etaDays = dist < 100 ? 1 : dist < 500 ? 2 : 3;
  return {
    courier: 'Delhivery',
    logo: '🚚',
    trackingId: generateTrackingId('DLV'),
    price,
    currency: rc.currency,
    etaDays,
    etaLabel: `${etaDays} day${etaDays > 1 ? 's' : ''}`,
    distanceKm: Math.round(dist),
    serviceType: 'Express Surface',
  };
}

// ─── BlueDart Mock ────────────────────────────────────────────────────────────
function bluedart(weight, pickup, delivery) {
  const dist = getDistanceKm(pickup, delivery);
  const rc = RATE_CARDS.bluedart;
  const price = Math.round(rc.basePrice + weight * rc.perKg + dist * rc.perKm);
  const etaDays = dist < 200 ? 1 : dist < 800 ? 2 : 3;
  return {
    courier: 'BlueDart',
    logo: '✈️',
    trackingId: generateTrackingId('BLD'),
    price,
    currency: rc.currency,
    etaDays,
    etaLabel: `${etaDays} day${etaDays > 1 ? 's' : ''}`,
    distanceKm: Math.round(dist),
    serviceType: 'Air Express',
  };
}

// ─── Ekart Mock ───────────────────────────────────────────────────────────────
function ekart(weight, pickup, delivery) {
  const dist = getDistanceKm(pickup, delivery);
  const rc = RATE_CARDS.ekart;
  const price = Math.round(rc.basePrice + weight * rc.perKg + dist * rc.perKm);
  const etaDays = dist < 150 ? 2 : dist < 600 ? 3 : 5;
  return {
    courier: 'Ekart',
    logo: '📦',
    trackingId: generateTrackingId('EKT'),
    price,
    currency: rc.currency,
    etaDays,
    etaLabel: `${etaDays} day${etaDays > 1 ? 's' : ''}`,
    distanceKm: Math.round(dist),
    serviceType: 'Economy',
  };
}

// ─── Compare All ─────────────────────────────────────────────────────────────
function compareCouriers(weight, pickup, delivery) {
  const results = [
    delhivery(weight, pickup, delivery),
    bluedart(weight, pickup, delivery),
    ekart(weight, pickup, delivery),
  ];
  return results.sort((a, b) => a.price - b.price);
}

module.exports = { delhivery, bluedart, ekart, compareCouriers };
