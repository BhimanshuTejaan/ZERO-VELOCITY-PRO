import { dbAdmin } from './_firebaseAdmin.js';
import { verifyUserToken } from './_auth.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Vercel Serverless Function: Create Razorpay Order securely
 * Endpoint: POST /api/create-order
 */
export default async function handler(req, res) {
  // CORS Headers to allow cross-origin requests from frontend and CEP
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Cache-Control', 'no-store');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // 1. Verify user session via Firebase ID token
  const authResult = await verifyUserToken(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ success: false, error: authResult.error });
  }

  // Load credentials and strip surrounding whitespace/quotes
  const envKeyId = (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^["']|["']$/g, '');
  const envKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/^["']|["']$/g, '');

  // Force official production Live Key ID (rzp_live_TLJvEN6IoOE3pq) to prevent invalid Key ID overrides
  const keyId = envKeyId.startsWith("rzp_live_") ? envKeyId : "rzp_live_TLJvEN6IoOE3pq";
  const keySecret = envKeySecret;

  if (!keySecret) {
    console.error("❌ RAZORPAY_KEY_SECRET environment variable is missing on server.");
    return res.status(500).json({
      success: false,
      error: 'RAZORPAY_KEY_SECRET environment variable is missing on server.'
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

    // Enforce pricing authority server-side
    const productId = body.productId || "zero_velocity";
    if (productId !== "zero_velocity") {
      return res.status(400).json({ success: false, error: 'Invalid or unknown product ID.' });
    }

    const amount = 9900; // Server-authoritative ₹99 (9900 paise)
    const currency = 'INR';

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        receipt: `receipt_zv_${Date.now()}`
      })
    });

    const responseText = await response.text();
    let orderData = {};
    try {
      orderData = JSON.parse(responseText);
    } catch (_e) {
      console.error("❌ Non-JSON response from Razorpay:", response.status, responseText);
      return res.status(response.status || 500).json({
        success: false,
        error: "Non-JSON response from Razorpay Orders API"
      });
    }

    if (!response.ok) {
      console.error("❌ Razorpay Orders API Error:", response.status, orderData);
      return res.status(response.status).json({
        success: false,
        error: orderData.error?.description || "Failed to create Razorpay Order"
      });
    }

    // Save initial order context for secure signature & payment verification later
    const orderDoc = {
      razorpayOrderId: orderData.id,
      firebaseUid: authResult.uid,
      email: authResult.email,
      customerName: authResult.displayName || null,
      productId: productId,
      expectedAmount: amount,
      expectedCurrency: currency,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      fulfilledAt: null,
      licenseKey: null,
      razorpayPaymentId: null
    };

    await dbAdmin.collection('paymentOrders').doc(orderData.id).set(orderDoc);

    console.log(`✅ Stored secure paymentOrders record for ${orderData.id}`);

    return res.status(200).json({
      success: true,
      order: orderData
    });

  } catch (err) {
    console.error("❌ Error in /api/create-order:", err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error creating Razorpay Order.'
    });
  }
}
