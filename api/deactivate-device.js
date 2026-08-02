import { dbAdmin } from './_firebaseAdmin.js';

/**
 * Vercel Serverless Function: Deactivate / Reset Device
 * Endpoint: POST /api/deactivate-device
 * 
 * Removes a specific deviceId from a license's devices map in Firestore and updates activatedDevices count.
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

    if (!licenseKey || !deviceId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: licenseKey and deviceId.'
      });
    }

    const docRef = dbAdmin.collection('licenses').doc(licenseKey);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        success: false,
        error: 'License key not found.'
      });
    }

    const data = snapshot.data() || {};
    const devices = data.devices || {};

    if (!devices[deviceId]) {
      return res.status(404).json({
        success: false,
        error: 'Device is not registered under this license key.'
      });
    }

    delete devices[deviceId];
    const activatedDevices = Object.keys(devices).length;

    await docRef.update({
      devices: devices,
      activatedDevices: activatedDevices
    });

    console.log(`🗑️ Device ${deviceId} deactivated for license: ${licenseKey}`);

    return res.status(200).json({
      success: true,
      message: 'Device deactivated successfully.',
      licenseKey: licenseKey,
      activatedDevices: activatedDevices
    });

  } catch (err) {
    console.error("❌ Error deactivating device:", err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while deactivating device.'
    });
  }
}
