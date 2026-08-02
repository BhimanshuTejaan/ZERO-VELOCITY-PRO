import { dbAdmin } from './_firebaseAdmin.js';

/**
 * Vercel Serverless Function: License Key & Device Verification
 * Endpoint: POST /api/verify-license
 * 
 * Verifies a license key against the Firestore 'licenses' collection using Firebase Admin SDK.
 * Handles device registration, lastSeenAt updates, and enforces maxDevices limits.
 * Includes explicit step-by-step diagnostic logging.
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

    console.log("==========================================");
    console.log("📥 [Backend /api/verify-license] Received Request");
    console.log("Received Request Body:", JSON.stringify(body, null, 2));
    console.log(`Step 1 - Received License Key: "${licenseKey}"`);

    if (!licenseKey) {
      console.warn("❌ Verification aborted: License key is missing.");
      return res.status(400).json({
        success: false,
        error: 'License key is required.'
      });
    }

    console.log(`Step 2 - Querying Firestore collection 'licenses' for document ID: "${licenseKey}"...`);
    const docRef = dbAdmin.collection('licenses').doc(licenseKey);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      console.warn(`Step 3 - Query Result: 0 documents found matching "${licenseKey}".`);
      return res.status(404).json({
        success: false,
        error: 'Invalid license key. Please check your key and try again.'
      });
    }

    const licenseData = snapshot.data() || {};
    console.log(`Step 3 - Query Result: 1 document found matching "${licenseKey}".`);
    console.log("Step 4 - Matched Document Data:", JSON.stringify(licenseData, null, 2));

    const status = licenseData.status || 'active';
    console.log(`Step 5 - License Status: "${status}"`);

    // Check if the license status is active
    if (status !== 'active') {
      console.warn(`❌ Step 5 Failed: Key "${licenseKey}" has status "${status}".`);
      return res.status(403).json({
        success: false,
        error: `This license key has been ${status}.`
      });
    }

    const maxDevices = typeof licenseData.maxDevices === 'number' ? licenseData.maxDevices : 2;
    const devices = licenseData.devices || {};
    const nowIso = new Date().toISOString();

    console.log(`Step 6 - Device Validation (Device ID: "${deviceId || 'N/A'}", Name: "${deviceName || 'N/A'}")`);
    console.log(`Current Registered Devices Count: ${Object.keys(devices).length} / Max Allowed: ${maxDevices}`);

    if (deviceId) {
      if (devices[deviceId]) {
        console.log(`✅ Device "${deviceId}" is already registered. Updating lastSeenAt.`);
        devices[deviceId].lastSeenAt = nowIso;
        if (deviceName && !devices[deviceId].deviceName) {
          devices[deviceId].deviceName = deviceName;
        }
        await docRef.update({
          devices: devices,
          activatedDevices: Object.keys(devices).length
        });
      } else {
        const currentRegisteredCount = Object.keys(devices).length;
        if (currentRegisteredCount >= maxDevices) {
          console.warn(`❌ Step 6 Failed: Device limit reached (${currentRegisteredCount}/${maxDevices}).`);
          return res.status(403).json({
            success: false,
            error: `Device limit reached. This license key is already active on ${currentRegisteredCount} of ${maxDevices} allowed devices.`
          });
        }

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

        console.log(`✅ Registered new device "${deviceName || deviceId}" for key: ${licenseKey}`);
      }
    }

    const finalActivatedCount = Object.keys(devices).length;
    const responsePayload = {
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
    };

    console.log("Step 7 - Final Response Payload:", JSON.stringify(responsePayload, null, 2));
    console.log("==========================================");

    return res.status(200).json(responsePayload);

  } catch (err) {
    console.error("❌ Error verifying license key:", err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while verifying license.'
    });
  }
}
