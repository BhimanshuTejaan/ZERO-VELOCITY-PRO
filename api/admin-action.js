import crypto from 'crypto';
import { dbAdmin } from './_firebaseAdmin.js';

// STRICT SINGLE ADMINISTRATOR ALLOWLIST
const SOLE_ADMIN_EMAIL = 'bhimanshutejaan@gmail.com';

/**
 * Generates a cryptographically secure random license key in format:
 * ZV-XXXX-XXXX-XXXX-XXXX
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
 * Vercel Serverless Function: Admin Dashboard Actions & Data Queries
 * Endpoint: POST /api/admin-action
 * 
 * Strict Security Policy:
 * Only bhimanshutejaan@gmail.com is authorized to execute actions or retrieve admin data.
 * All other emails/unauthenticated requests return HTTP 403 Forbidden immediately.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action, adminEmail, licenseKey } = body;

    // Strict Independent Backend Security Verification
    const normalizedEmail = (adminEmail || '').trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail !== SOLE_ADMIN_EMAIL) {
      console.warn(`🔒 HTTP 403 FORBIDDEN: Unauthorized Admin API attempt by: [${adminEmail || 'ANONYMOUS'}]`);
      return res.status(403).json({ 
        success: false, 
        error: 'HTTP 403 Forbidden: You do not have administrator privileges.' 
      });
    }

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

      const newLicenseKey = generateKey();
      const nowIso = new Date().toISOString();

      const newDoc = {
        licenseKey: newLicenseKey,
        customerName: customerName || null,
        email: email || null,
        firebaseUid: null,
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
          { action: `License Generated via Admin Tools (${licenseType || 'Lifetime'})`, date: nowIso, by: normalizedEmail }
        ]
      };

      await dbAdmin.collection('licenses').doc(newLicenseKey).set(newDoc);
      console.log(`✨ Admin ${normalizedEmail} manually generated license ${newLicenseKey} (${licenseType || 'Lifetime'})`);

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
        { action: 'License Enabled', date: now, by: normalizedEmail }
      ];

      await docRef.update({
        status: 'active',
        activityLog: updatedLog,
        updatedAt: now
      });

      console.log(`✅ Admin ${normalizedEmail} enabled license ${licenseKey}`);
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
        { action: 'License Disabled', date: now, by: normalizedEmail }
      ];

      await docRef.update({
        status: 'disabled',
        activityLog: updatedLog,
        updatedAt: now
      });

      console.log(`✅ Admin ${normalizedEmail} disabled license ${licenseKey}`);
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
        { action: 'Device Reset', date: now, by: normalizedEmail, previousDeviceCount: (currentData.registeredDevices || []).length }
      ];

      await docRef.update({
        registeredDevices: [],
        activityLog: updatedLog,
        updatedAt: now
      });

      console.log(`✅ Admin ${normalizedEmail} reset devices for license ${licenseKey}`);
      return res.status(200).json({
        success: true,
        message: `Registered devices reset for ${licenseKey}.`
      });
    }

    // 6. Delete Test License Action
    if (action === 'delete_license') {
      await docRef.delete();
      console.log(`🗑️ Admin ${normalizedEmail} deleted license ${licenseKey}`);
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
