/**
 * Haversine formula — distance in km between two lat/lng points
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find nearest available delivery partner using MongoDB User model
 * @param {import('mongoose').Model} UserModel
 * @param {{ lat: number, lng: number }} pickupCoords
 */
async function findNearestPartner(UserModel, pickupCoords) {
  const partners = await UserModel.find({
    role: 'deliveryPartner',
    status: 'available',
  }).select('name email currentLocation status').lean();

  if (!partners.length) return null;

  let nearest = null;
  let minDist = Infinity;

  for (const p of partners) {
    if (!p.currentLocation) continue;
    const dist = haversineDistance(
      pickupCoords.lat, pickupCoords.lng,
      p.currentLocation.lat, p.currentLocation.lng
    );
    if (dist < minDist) {
      minDist = dist;
      nearest = { id: p._id.toString(), data: p, distance: dist };
    }
  }

  return nearest;
}

module.exports = { haversineDistance, findNearestPartner };
