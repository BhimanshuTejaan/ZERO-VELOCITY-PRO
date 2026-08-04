/**
 * Vercel Serverless Function: Create Razorpay Order
 * Endpoint: POST /api/create-order
 * 
 * Purpose:
 * Creates an official Razorpay Order ID on the server before opening Checkout on the client.
 * Fixes international card / unanchored payment errors in Razorpay test mode.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.
  // Falls back to live key ID if process.env.RAZORPAY_KEY_ID is missing on Vercel.
  const rawKeyId = process.env.RAZORPAY_KEY_ID || "rzp_live_TLJvEN6IoOE3pq";
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

  const keyId = rawKeyId.trim();
  const keySecret = rawKeySecret.trim();

  if (!keySecret) {
    console.error("❌ RAZORPAY_KEY_SECRET is missing from server environment variables.");
    return res.status(500).json({ success: false, error: 'RAZORPAY_KEY_SECRET environment variable is missing.' });
  }



  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const amount = body.amount || 100; // default 100 paise (₹1)

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
      console.error("❌ Razorpay API Error:", orderData);
      return res.status(response.status).json({
        success: false,
        error: orderData.error?.description || "Failed to create Razorpay Order"
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
