import adminApp from './_firebaseAdmin.js';
import { getAuth } from 'firebase-admin/auth';

const adminAuth = getAuth(adminApp);

/**
 * Shared Backend Helper to authenticate Firebase ID Tokens from the Authorization header.
 * Strictly checks that the token is valid, unexpired, and retrieves verified UID/email.
 */
export async function verifyUserToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, status: 401, error: 'Missing or malformed Authorization header.' };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { authenticated: false, status: 401, error: 'Authorization token not provided.' };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return {
      authenticated: true,
      uid: decodedToken.uid,
      email: (decodedToken.email || '').trim().toLowerCase(),
      emailVerified: decodedToken.email_verified === true,
      displayName: typeof decodedToken.name === 'string'
        ? decodedToken.name.trim().slice(0, 100)
        : ''
    };
  } catch (err) {
    console.error("❌ Firebase token verification failed:", err.message);
    return { authenticated: false, status: 401, error: 'Invalid or expired Firebase authentication token.' };
  }
}
