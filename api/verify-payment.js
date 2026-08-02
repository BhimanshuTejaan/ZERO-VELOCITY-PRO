import crypto from 'crypto';

/**
 * Vercel Serverless Function: Razorpay Payment Signature Verification
 * Endpoint: POST /api/verify-payment
 * 
 * Expected JSON Body:
 * {
 *   "razorpay_payment_id": "pay_...",
 *   "razorpay_order_id": "order_...",
 *   "razorpay_signature": "..."
 * }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required payment parameters (razorpay_payment_id, razorpay_signature).' 
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("❌ RAZORPAY_KEY_SECRET environment variable is missing on server.");
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error: RAZORPAY_KEY_SECRET is not configured.' 
      });
    }

    // Razorpay signature formula: order_id + "|" + payment_id (or payment_id if order_id is omitted)
    const payloadToSign = razorpay_order_id 
      ? `${razorpay_order_id}|${razorpay_payment_id}` 
      : `${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadToSign)
      .digest('hex');

    // Secure timing-safe signature comparison
    const isLengthMatch = expectedSignature.length === razorpay_signature.length;
    const isSignatureValid = isLengthMatch && crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );

    if (isSignatureValid) {
      console.log(`✅ Payment verified successfully: ${razorpay_payment_id}`);
      return res.status(200).json({
        success: true
      });
    } else {
      console.warn(`⚠️ Signature verification failed for payment: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature.'
      });
    }
  } catch (err) {
    console.error("❌ Error verifying payment signature:", err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while processing payment verification.'
    });
  }
}
