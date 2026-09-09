import crypto from 'crypto';
import { dbAdmin, authAdmin } from './_firebaseAdmin.js';
import { verifyUserToken } from './_auth.js';

// STRICT SINGLE ADMINISTRATOR ALLOWLIST
const SOLE_ADMIN_EMAIL = 'bhimanshutejaan@gmail.com';

/**
 * Generates a cryptographically secure random license key.
 */
function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const getChunk = (len) => {
    const bytes = crypto.randomBytes(len);
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars[bytes[i] % chars.length];
    }
    return res;
  };
  return `ZV-${getChunk(4)}-${getChunk(4)}-${getChunk(4)}-${getChunk(4)}`;
}

/**
 * Vercel Serverless Function: Secure Admin Actions
 * Endpoint: POST /api/admin-action
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // 1. Verify user session via Firebase ID Token
  const authResult = await verifyUserToken(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ success: false, error: authResult.error });
  }

  // 2. Strict Administrator Verification
  if (authResult.email !== SOLE_ADMIN_EMAIL || !authResult.emailVerified) {
    console.warn(`🔒 HTTP 403 FORBIDDEN: Unauthorized Admin API attempt by: [${authResult.email}]`);
    return res.status(403).json({
      success: false,
      error: 'HTTP 403 Forbidden: You do not have administrator privileges.'
    });
  }

  const adminEmail = authResult.email;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action, licenseKey } = body;

    // 1. Fetch All Licenses for Admin Dashboard
    if (action === 'fetch_all_licenses') {
      const snapshot = await dbAdmin.collection('licenses').get();
      const licenses = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        licenses.push({
          id: doc.id,
          ...data
        });
      });

      // Sort most recent first
      licenses.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));

      return res.status(200).json({
        success: true,
        licenses
      });
    }

    // 2. Generate Manual License Action (Admin Tool)
    if (action === 'generate_manual_license') {
      const { customerName, email, licenseType, maxDevices, notes } = body;

      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : null;
      const sanitizedName = typeof customerName === 'string' ? customerName.trim() : null;

      let matchedUid = null;
      if (normalizedEmail) {
        try {
          const existingUser = await authAdmin.getUserByEmail(normalizedEmail);
          if (existingUser && existingUser.uid) {
            matchedUid = existingUser.uid;
            console.log(`🎯 Admin grant pre-linked to existing Firebase UID ${matchedUid} (${normalizedEmail})`);
          }
        } catch (_errUser) {
          // User has not registered yet; will be auto-linked upon their first sign-in via /api/my-licenses
        }
      }

      const newLicenseKey = generateKey();
      const nowIso = new Date().toISOString();

      const newDoc = {
        licenseKey: newLicenseKey,
        customerName: sanitizedName,
        email: normalizedEmail,
        firebaseUid: matchedUid,
        razorpayPaymentId: "ADMIN_GENERATED",
        razorpayOrderId: null,
        source: "admin",
        licenseType: licenseType || "Lifetime",
        maxDevices: parseInt(maxDevices || '1', 10),
        notes: notes || null,
        purchaseDate: nowIso,
        status: "active",
        registeredDevices: [],
        activityLog: [
          { action: `License Generated via Admin Tools (${licenseType || 'Lifetime'})`, date: nowIso, by: adminEmail }
        ]
      };

      await dbAdmin.collection('licenses').doc(newLicenseKey).set(newDoc);
      console.log(`✨ Admin ${adminEmail} manually generated license ${newLicenseKey} for ${normalizedEmail || 'unassigned'}`);

      return res.status(200).json({
        success: true,
        licenseKey: newLicenseKey,
        license: newDoc
      });
    }

    // Require licenseKey for document modifications
    if (!licenseKey) {
      return res.status(400).json({ success: false, error: 'Missing required parameter: licenseKey.' });
    }

    const docRef = dbAdmin.collection('licenses').doc(licenseKey);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ success: false, error: `License ${licenseKey} not found.` });
    }

    const currentData = docSnap.data();
    const now = new Date().toISOString();
    const existingLog = Array.isArray(currentData.activityLog) ? currentData.activityLog : [];

    // 3. Enable License Action
    if (action === 'enable_license') {
      const updatedLog = [
        ...existingLog,
        { action: 'License Enabled', date: now, by: adminEmail }
      ];

      await docRef.update({
        status: 'active',
        activityLog: updatedLog,
        updatedAt: now
      });

      console.log(`✅ Admin ${adminEmail} enabled license ${licenseKey}`);
      return res.status(200).json({
        success: true,
        message: `License ${licenseKey} has been enabled.`,
        status: 'active'
      });
    }

    // 4. Disable License Action
    if (action === 'disable_license') {
      const updatedLog = [
        ...existingLog,
        { action: 'License Disabled', date: now, by: adminEmail }
      ];

      await docRef.update({
        status: 'disabled',
        activityLog: updatedLog,
        updatedAt: now
      });

      console.log(`✅ Admin ${adminEmail} disabled license ${licenseKey}`);
      return res.status(200).json({
        success: true,
        message: `License ${licenseKey} has been disabled.`,
        status: 'disabled'
      });
    }

    // 5. Reset Devices Action
    if (action === 'reset_devices') {
      const updatedLog = [
        ...existingLog,
        { action: 'Device Reset', date: now, by: adminEmail, previousDeviceCount: (currentData.registeredDevices || []).length }
      ];

      await docRef.update({
        registeredDevices: [],
        activityLog: updatedLog,
        updatedAt: now
      });

      console.log(`✅ Admin ${adminEmail} reset devices for license ${licenseKey}`);
      return res.status(200).json({
        success: true,
        message: `Registered devices reset for ${licenseKey}.`
      });
    }

    // 6. Delete Test License Action
    if (action === 'delete_license') {
      await docRef.delete();
      console.log(`🗑️ Admin ${adminEmail} deleted license ${licenseKey}`);
      return res.status(200).json({
        success: true,
        message: `License ${licenseKey} has been permanently deleted.`
      });
    }

    return res.status(400).json({ success: false, error: `Invalid admin action: ${action}` });

  } catch (err) {
    console.error("❌ Error executing admin action:", err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing admin action.'
    });
  }
}
