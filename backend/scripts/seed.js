/**
 * ParcelBridge — Firestore Seed Data Script
 * 
 * Run with: node scripts/seed.js
 * Requires: GOOGLE_APPLICATION_CREDENTIALS or running via `gcloud auth application-default login`
 */

require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'startupidea-241094',
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

async function seed() {
  console.log('🌱 Seeding ParcelBridge Firestore...');

  const now = new Date().toISOString();

  // ── Delivery Partners ────────────────────────────────────────────────────────
  const partners = [
    {
      email: 'partner1@parcelbridge.com',
      name: 'Ravi Kumar',
      phone: '+91 9876543210',
      role: 'deliveryPartner',
      status: 'available',
      vehicleType: 'bike',
      licenseNumber: 'AP09X1234',
      currentLocation: { lat: 17.385, lng: 78.4867 }, // Hyderabad
      totalDeliveries: 42,
      totalEarnings: 8400,
      createdAt: now,
      updatedAt: now,
    },
    {
      email: 'partner2@parcelbridge.com',
      name: 'Priya Sharma',
      phone: '+91 9876543211',
      role: 'deliveryPartner',
      status: 'available',
      vehicleType: 'scooter',
      licenseNumber: 'MH12AB5678',
      currentLocation: { lat: 19.076, lng: 72.8777 }, // Mumbai
      totalDeliveries: 28,
      totalEarnings: 5600,
      createdAt: now,
      updatedAt: now,
    },
    {
      email: 'partner3@parcelbridge.com',
      name: 'Arun Singh',
      phone: '+91 9876543212',
      role: 'deliveryPartner',
      status: 'available',
      vehicleType: 'car',
      licenseNumber: 'KA01CD9012',
      currentLocation: { lat: 12.9716, lng: 77.5946 }, // Bangalore
      totalDeliveries: 15,
      totalEarnings: 3000,
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (let i = 0; i < partners.length; i++) {
    await db.collection('deliveryPartners').doc(`partner_seed_${i + 1}`).set(partners[i]);
  }
  console.log(`  ✅ ${partners.length} delivery partners seeded`);

  // ── Admin User ────────────────────────────────────────────────────────────────
  // NOTE: You must create this user in Firebase Auth first and use that UID
  const adminUser = {
    email: 'sujithlavudu@gmail.com',
    name: 'Sujith (Admin)',
    phone: '',
    role: 'admin',
    createdAt: now,
    updatedAt: now,
  };
  // This creates a placeholder — replace 'FIREBASE_ADMIN_UID' with your actual Firebase UID
  await db.collection('users').doc('FIREBASE_ADMIN_UID').set(adminUser);
  console.log('  ✅ Admin user placeholder seeded (update with real UID)');

  // ── Couriers Reference ───────────────────────────────────────────────────────
  const couriers = [
    { name: 'Delhivery', logo: '🚚', serviceType: 'Express Surface', active: true, createdAt: now },
    { name: 'BlueDart', logo: '✈️', serviceType: 'Air Express', active: true, createdAt: now },
    { name: 'Ekart', logo: '📦', serviceType: 'Economy', active: true, createdAt: now },
  ];

  for (const c of couriers) {
    await db.collection('couriers').add(c);
  }
  console.log(`  ✅ ${couriers.length} couriers seeded`);

  console.log('\n🎉 Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
