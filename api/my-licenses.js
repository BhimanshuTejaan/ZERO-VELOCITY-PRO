import { dbAdmin } from './_firebaseAdmin.js';
import { verifyUserToken } from './_auth.js';

/**
 * Vercel Serverless Function: Secure User Entitlement & License Reconciliation
 * Endpoint: GET, POST /api/my-licenses
 *
 * 1. Verifies Firebase Auth ID token.
 * 2. Fetches licenses owned by the user (by firebaseUid and normalized email).
 * 3. Auto-links unlinked admin-granted licenses (firebaseUid == null) to the authenticated UID.
 * 4. Normalizes license data and returns active licenses without exposing sensitive credentials.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET or POST.' });
  }

  // 1. Verify User Authentication
  const authResult = await verifyUserToken(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ success: false, error: authResult.error || 'Authentication required.' });
  }

  const { uid, email } = authResult;
  const normalizedUserEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  try {
    const licensesMap = new Map();

    // Query 1: Licenses already linked to this user's UID
    const uidSnapshot = await dbAdmin.collection('licenses').where('firebaseUid', '==', uid).get();
    uidSnapshot.forEach(doc => {
      licensesMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Query 2: Look for unlinked or email-matching licenses
    if (normalizedUserEmail) {
      // Query by exact normalized email
      const emailSnapshot = await dbAdmin.collection('licenses').where('email', '==', normalizedUserEmail).get();
      emailSnapshot.forEach(doc => {
        if (!licensesMap.has(doc.id)) {
          licensesMap.set(doc.id, { id: doc.id, ...doc.data() });
        }
      });

      // Query by raw email if casing differed
      if (email && email !== normalizedUserEmail) {
        const rawEmailSnapshot = await dbAdmin.collection('licenses').where('email', '==', email).get();
        rawEmailSnapshot.forEach(doc => {
          if (!licensesMap.has(doc.id)) {
            licensesMap.set(doc.id, { id: doc.id, ...doc.data() });
          }
        });
      }

      // Query 3: Scan unlinked admin grants (firebaseUid == null) for case-insensitive / whitespace email matches
      const unlinkedAdminGrants = await dbAdmin.collection('licenses').where('firebaseUid', '==', null).get();
      const docsToLink = [];

      unlinkedAdminGrants.forEach(doc => {
        const data = doc.data();
        const docEmail = typeof data.email === 'string' ? data.email.trim().toLowerCase() : '';
        if (docEmail && docEmail === normalizedUserEmail) {
          if (!licensesMap.has(doc.id)) {
            licensesMap.set(doc.id, { id: doc.id, ...data });
          }
          docsToLink.push(doc.ref);
        }
      });

      // Auto-link unlinked admin-granted licenses to this authenticated UID
      if (docsToLink.length > 0) {
        const nowIso = new Date().toISOString();
        const linkPromises = docsToLink.map(docRef => 
          docRef.update({
            firebaseUid: uid,
            email: normalizedUserEmail,
            linkedAt: nowIso
          }).catch(err => {
            console.warn(`⚠️ Non-fatal: could not auto-link license ${docRef.id}:`, err.message);
          })
        );
        await Promise.all(linkPromises);
        console.log(`🔗 Successfully auto-linked ${docsToLink.length} admin grant license(s) to UID ${uid}`);
      }
    }

    // Sanitize and sort licenses
    const licenseList = Array.from(licensesMap.values()).map(lic => ({
      licenseKey: lic.licenseKey || lic.id,
      status: lic.status || 'active',
      licenseType: lic.licenseType || 'Lifetime',
      maxDevices: typeof lic.maxDevices === 'number' ? lic.maxDevices : 1,
      registeredDevices: Array.isArray(lic.registeredDevices) ? lic.registeredDevices : [],
      purchaseDate: lic.purchaseDate || null,
      customerName: lic.customerName || null,
      email: lic.email || normalizedUserEmail
    }));

    licenseList.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));

    return res.status(200).json({
      success: true,
      licenses: licenseList
    });

  } catch (err) {
    console.error('❌ Error fetching user licenses in /api/my-licenses:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error retrieving licenses.'
    });
  }
}
