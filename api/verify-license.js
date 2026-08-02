import { dbAdmin } from './_firebaseAdmin.js';

/**
 * Vercel Serverless Function: License Key & Device Verification
 * Endpoint: POST /api/verify-license
 * 
 * Verifies a license key against the Firestore 'licenses' collection using Firebase Admin SDK.
 * Handles device registration, lastSeenAt updates, and enforces maxDevices limits.
 * Includes CORS headers for Adobe CEP extension access.
 */
export default async function handler(req, res) {
  // CORS Headers to allow requests from Adobe CEP extension sandbox
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const rawKey = body.licenseKey || '';
    const licenseKey = rawKey.trim().toUpperCase();
    const deviceId = (body.deviceId || '').trim();
    const deviceName = (body.deviceName || '').trim();

    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        error: 'License key is required.'
      });
    }

    // Query Firestore collection 'licenses' using doc ID (which is the licenseKey string)
    const docRef = dbAdmin.collection('licenses').doc(licenseKey);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      console.warn(`⚠️ Verification attempt failed: Key "${licenseKey}" not found in Firestore.`);
      return res.status(404).json({
        success: false,
        error: 'Invalid license key. Please check your key and try again.'
      });
    }

    const licenseData = snapshot.data() || {};
    const status = licenseData.status || 'active';

    // Check if the license status is active
    if (status !== 'active') {
      console.warn(`⚠️ Verification attempt failed: Key "${licenseKey}" is ${status}.`);
      return res.status(403).json({
        success: false,
        error: `This license key has been ${status}.`
      });
    }

    const maxDevices = typeof licenseData.maxDevices === 'number' ? licenseData.maxDevices : 2;
    const devices = licenseData.devices || {};
    const nowIso = new Date().toISOString();

    if (deviceId) {
      if (devices[deviceId]) {
        // Device is already registered -> update lastSeenAt
        devices[deviceId].lastSeenAt = nowIso;
        if (deviceName && !devices[deviceId].deviceName) {
          devices[deviceId].deviceName = deviceName;
        }
        await docRef.update({
          devices: devices,
          activatedDevices: Object.keys(devices).length
        });
      } else {
        // New device attempting registration -> check limit
        const currentRegisteredCount = Object.keys(devices).length;
        if (currentRegisteredCount >= maxDevices) {
          console.warn(`⚠️ Device limit reached for key ${licenseKey}: ${currentRegisteredCount}/${maxDevices} active.`);
          return res.status(403).json({
            success: false,
            error: `Device limit reached. This license key is already active on ${currentRegisteredCount} of ${maxDevices} allowed devices.`
          });
        }

        // Under limit -> register new device
        devices[deviceId] = {
          deviceId: deviceId,
          deviceName: deviceName || 'Unknown Machine',
          activatedAt: nowIso,
          lastSeenAt: nowIso
        };

        await docRef.update({
          devices: devices,
          activatedDevices: Object.keys(devices).length
        });

        console.log(`📱 Registered new device "${deviceName || deviceId}" for key: ${licenseKey}`);
      }
    }

    const finalActivatedCount = Object.keys(devices).length;

    console.log(`✅ License verified successfully: ${licenseKey} (Devices: ${finalActivatedCount}/${maxDevices})`);

    // Return structured license metadata
    return res.status(200).json({
      success: true,
      message: 'License verified successfully.',
      license: {
        licenseKey: licenseData.licenseKey || licenseKey,
        status: status,
        product: licenseData.product || 'Zero Velocity Caption Designer',
        version: licenseData.version || '1.0.0',
        purchaseDate: licenseData.purchaseDate || null,
        email: licenseData.email || null,
        firebaseUid: licenseData.firebaseUid || null,
        maxDevices: maxDevices,
        activatedDevices: finalActivatedCount
      }
    });

  } catch (err) {
    console.error("❌ Error verifying license key:", err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while verifying license.'
    });
  }
}
