/**
 * Vercel Serverless Function: Create Razorpay Order
 * Endpoint: POST /api/create-order
 * 
 * Purpose:
 * Creates an official Razorpay Order ID on the server before opening Checkout on the client.
 * Fixes international card / unanchored payment errors in Razorpay test mode.
 */
export default async function handler(req, res) {
  // CORS Headers to allow cross-origin requests from frontend and CEP
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
      error: 'RAZORPAY_KEY_SECRET environment variable is missing on server.',
      diagnostics: {
        keyIdUsed: keyId,
        keySecretExists: false
      }
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const amount = body.amount || 9900; // default 9900 paise (₹99)

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        amount: amount,
        currency: 'INR',
        receipt: `receipt_zv_${Date.now()}`
      })
    });

    const orderData = await response.json();

    if (!response.ok) {
      console.error("❌ Razorpay Orders API Error:", response.status, orderData);
      return res.status(response.status).json({
        success: false,
        error: orderData.error?.description || "Failed to create Razorpay Order",
        diagnostics: {
          keyIdUsed: keyId,
          keySecretExists: Boolean(keySecret),
          razorpayCode: orderData.error?.code,
          razorpayStatus: response.status
        }
      });
    }

    console.log(`✅ Created Razorpay Order ${orderData.id} for amount ₹${amount / 100}`);
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
