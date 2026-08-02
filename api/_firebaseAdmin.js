import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Singleton Firebase Admin SDK initializer using official Firebase Admin v12+ ESM API.
 * 
 * Supports credential loading via:
 * Option 1: FIREBASE_SERVICE_ACCOUNT (full JSON string)
 * Option 2: FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY + FIREBASE_PROJECT_ID
 */
function initializeFirebaseAdmin() {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  let credential = null;

  // Option 1: Full Service Account JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      credential = cert(serviceAccount);
    } catch (err) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT JSON string:", err.message);
    }
  }

  // Option 2: Individual environment variables
  if (!credential && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    credential = cert({
      projectId: process.env.FIREBASE_PROJECT_ID || "zero-velocity-captions",
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    });
  }

  const appOptions = {
    projectId: process.env.FIREBASE_PROJECT_ID || "zero-velocity-captions"
  };

  if (credential) {
    appOptions.credential = credential;
  }

  return initializeApp(appOptions);
}

const adminApp = initializeFirebaseAdmin();
export const dbAdmin = getFirestore(adminApp);
export default adminApp;
