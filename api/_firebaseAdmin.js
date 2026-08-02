import admin from 'firebase-admin';

/**
 * Singleton Firebase Admin SDK initializer for Vercel Serverless Functions.
 * 
 * Supports credential loading via:
 * Option 1: FIREBASE_SERVICE_ACCOUNT (full JSON string)
 * Option 2: FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_PROJECT_ID
 */
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin;
  }

  let credential = null;

  // Option 1: Full Service Account JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      credential = admin.credential.cert(serviceAccount);
    } catch (err) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON string:", err.message);
    }
  }

  // Option 2: Individual environment variables
  if (!credential && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID || "zero-velocity-captions",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    });
  }

  // Option 3: Fallback to application default credentials
  if (!credential) {
    console.warn("⚠️ No explicit Firebase Admin credentials found. Attempting applicationDefault()...");
    try {
      credential = admin.credential.applicationDefault();
    } catch (err) {
      console.error("❌ Application default credentials unavailable:", err.message);
    }
  }

  admin.initializeApp({
    credential: credential || undefined,
    projectId: process.env.FIREBASE_PROJECT_ID || "zero-velocity-captions"
  });

  return admin;
}

const adminInstance = initializeFirebaseAdmin();
export const dbAdmin = adminInstance.firestore();
export default adminInstance;
