import crypto from 'crypto';
import { dbAdmin } from './_firebaseAdmin.js';

/**
 * Retrieves the mandatory Ed25519 Private Key from process.env.LICENSE_ED25519_PRIVATE_KEY.
 * No fallbacks or hardcoded secrets are allowed in production.
 */
function getMandatoryPrivateKey() {
  const pemKey = process.env.LICENSE_ED25519_PRIVATE_KEY;
  if (!pemKey || typeof pemKey !== 'string' || !pemKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error("❌ CRITICAL SERVER SECURITY ERROR: Mandatory LICENSE_ED25519_PRIVATE_KEY environment variable is missing or invalid.");
    return null;
  }
  try {
    return crypto.createPrivateKey({ key: pemKey, format: 'pem', type: 'pkcs8' });
  } catch (errKey) {
    console.error("❌ CRITICAL SERVER SECURITY ERROR: Failed to parse LICENSE_ED25519_PRIVATE_KEY:", errKey);
    return null;
  }
}

/**
 * Generates an offline token signed with Ed25519 Asymmetric Private Key.
 */
function generateOfflineToken(privateKey, licenseKey, deviceId, gracePeriodDays) {
  try {
    const issuedAt = new Date().toISOString();
    const period = typeof gracePeriodDays === 'number' ? gracePeriodDays : 7;
    const rawPayload = `${licenseKey}:${deviceId}:${issuedAt}:${period}`;
    
    const signature = crypto.sign(null, Buffer.from(rawPayload), privateKey).toString('hex');
    
    return {
      licenseKey: licenseKey,
      deviceId: deviceId,
      issuedAt: issuedAt,
      gracePeriodDays: period,
      signature: signature
    };
  } catch (errSign) {
    console.error("❌ Error generating Ed25519 signature:", errSign);
    return null;
  }
}

/**
 * Vercel Serverless Function: License Key & Device Verification
 * Endpoint: POST /api/verify-license
 * 
 * Verifies a license key against the Firestore 'licenses' collection using Firebase Admin SDK.
 * Generates an Ed25519 signed offlineToken using mandatory LICENSE_ED25519_PRIVATE_KEY.
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

  // Strictly enforce mandatory Ed25519 Private Key from environment variables
  const privateKey = getMandatoryPrivateKey();
  if (!privateKey) {
    return res.status(500).json({
      success: false,
      error: 'Server security configuration error: Mandatory signing key is missing on backend.'
    });
  }

  try {
    let body = {};
    if (typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (_e) {
        body = {};
      }
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }
    const rawKey = body.licenseKey || '';
    const licenseKey = rawKey.trim().toUpperCase();
    const deviceId = (body.deviceId || '').trim();
    const deviceName = (body.deviceName || '').trim();

    console.log("==========================================");
    console.log("📥 [Backend /api/verify-license] Received Request");
    console.log("Received Request Body:", JSON.stringify(body, null, 2));

    if (!licenseKey) {
      console.warn("❌ Verification aborted: License key is missing.");
      return res.status(400).json({
        success: false,
        error: 'License key is required.'
      });
    }

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
    const status = licenseData.status || 'active';

    // Check if the license status is active
    if (status !== 'active') {
      console.warn(`❌ Key "${licenseKey}" has status "${status}".`);
      return res.status(403).json({
        success: false,
        error: `This license key has been ${status}.`
      });
    }

    const maxDevices = typeof licenseData.maxDevices === 'number' ? licenseData.maxDevices : 1;
    const gracePeriodDays = typeof licenseData.gracePeriodDays === 'number' ? licenseData.gracePeriodDays : 7;
    const devices = licenseData.devices || {};
    const nowIso = new Date().toISOString();

    if (deviceId) {
      if (devices[deviceId]) {
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
          console.warn(`❌ Device limit reached (${currentRegisteredCount}/${maxDevices}).`);
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
    const offlineToken = generateOfflineToken(privateKey, licenseKey, deviceId, gracePeriodDays);

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
        activatedDevices: finalActivatedCount,
        gracePeriodDays: gracePeriodDays
      },
      offlineToken: offlineToken
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
