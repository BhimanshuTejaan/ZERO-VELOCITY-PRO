import crypto from 'crypto';
import { dbAdmin } from './_firebaseAdmin.js';
import { sendLicenseConfirmationEmail } from './_email.js';

/**
 * Generates a cryptographically secure random license key in format:
 * ZV-XXXX-XXXX-XXXX-XXXX
 */
function generateLicenseKey() {
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
 * Vercel Serverless Function: Razorpay Signature Verification, License Storage & Email Confirmation
 * Endpoint: POST /api/verify-payment
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      firebaseUid,
      email,
      customerName
    } = body;

    // Validate required payment parameters
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

    // Formula: order_id + "|" + payment_id (or payment_id if order_id is omitted)
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

    if (!isSignatureValid) {
      console.warn(`⚠️ Signature verification failed for payment: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature.'
      });
    }

    console.log(`✅ Payment signature verified successfully: ${razorpay_payment_id}`);

    // Generate unique license key
    const licenseKey = generateLicenseKey();
    const purchaseDate = new Date().toISOString();

    const licenseDocument = {
      licenseKey,
      firebaseUid: firebaseUid || null,
      email: email || null,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id || null,
      purchaseDate,
      status: "active"
    };

    // Store document in Firestore collection 'licenses' using Firebase Admin SDK (bypasses security rules)
    await dbAdmin.collection('licenses').doc(licenseKey).set(licenseDocument);

    console.log(`🎉 License ${licenseKey} created & saved via Firebase Admin SDK for user: ${email || firebaseUid}`);

    // Attempt sending confirmation email asynchronously (isolated so email failures NEVER break purchase success)
    try {
      if (email) {
        await sendLicenseConfirmationEmail({
          recipientEmail: email,
          customerName: customerName || null,
          licenseKey,
          purchaseDate,
          razorpayPaymentId: razorpay_payment_id,
          downloadUrl: process.env.CUSTOMER_DOWNLOAD_URL || null
        });
      }
    } catch (emailErr) {
      console.error("❌ Isolated error during email dispatch attempt:", emailErr);
    }

    // Return required success payload to customer
    return res.status(200).json({
      success: true,
      licenseKey: licenseKey
    });

  } catch (err) {
    console.error("❌ Error during payment verification & license generation:", err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error processing payment verification and license storage.'
    });
  }
}
