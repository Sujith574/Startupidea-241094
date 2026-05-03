const admin = require('firebase-admin');

// When running on Google Cloud Run, Application Default Credentials
// are automatically available — no key file needed.
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'STARTUPIDEA-241094',
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
