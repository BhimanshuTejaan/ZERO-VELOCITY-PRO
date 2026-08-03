import { dbAdmin } from './_firebaseAdmin.js';

// Default list of authorized admin emails
const ALLOWED_ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'bhimanshutejaan@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase());

/**
 * Vercel Serverless Function: Admin Dashboard Actions & Data Queries
 * Endpoint: POST /api/admin-action
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { action, adminEmail, licenseKey } = body;

    // Security Check: Verify admin email
    if (!adminEmail || !ALLOWED_ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
      console.warn(`🔒 Unauthorized Admin Access Attempt by: ${adminEmail}`);
      return res.status(403).json({ 
        success: false, 
        error: 'Access Denied: You do not have administrator permissions.' 
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

    // 2. Enable License Action
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

    // 3. Disable License Action
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

    // 4. Reset Devices Action
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

    // 5. Delete Test License Action
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
