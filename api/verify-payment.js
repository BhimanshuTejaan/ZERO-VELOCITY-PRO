import crypto from 'crypto';
import { dbAdmin } from './_firebaseAdmin.js';
import { verifyUserToken } from './_auth.js';
import { sendLicenseConfirmationEmail } from './_email.js';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Generates a cryptographically secure random license key.
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
 * Vercel Serverless Function: Secure & Idempotent Payment Verification
 * Endpoint: POST /api/verify-payment
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  // 1. Verify User Token
  const authResult = await verifyUserToken(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ success: false, error: authResult.error });
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

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    // Validate inputs as bounded strings
    const validateString = (val, maxLen) => {
      return typeof val === 'string' && val.length > 0 && val.length <= maxLen;
    };

    if (!validateString(razorpay_payment_id, 100) ||
        !validateString(razorpay_order_id, 100) ||
        !validateString(razorpay_signature, 256)) {
      return res.status(400).json({ success: false, error: 'Invalid or malformed payment identifiers.' });
    }

    // 2. Fetch Stored Order document to assert price authority
    const orderDocRef = dbAdmin.collection('paymentOrders').doc(razorpay_order_id);
    const orderSnapshot = await orderDocRef.get();

    if (!orderSnapshot.exists) {
      return res.status(404).json({ success: false, error: 'Payment order record not found.' });
    }

    const orderData = orderSnapshot.data();

    // Verify ownership of the order
    if (orderData.firebaseUid !== authResult.uid) {
      return res.status(403).json({ success: false, error: 'Payment order ownership verification failed.' });
    }

    // Assert expected product pricing parameters
    if (orderData.productId !== 'zero_velocity' ||
        orderData.expectedAmount !== 9900 ||
        orderData.expectedCurrency !== 'INR') {
      return res.status(400).json({ success: false, error: 'Payment order details mismatch.' });
    }

    // 3. HMAC Signature Verification & Credentials Resolution
    let keyId = "";
    let secret = "";

    if (process.env.VERCEL_ENV === 'preview') {
      const envTestKeyId = (process.env.RAZORPAY_TEST_KEY_ID || "").trim().replace(/^["']|["']$/g, '');
      const envTestKeySecret = (process.env.RAZORPAY_TEST_KEY_SECRET || "").trim().replace(/^["']|["']$/g, '');
      if (!envTestKeyId || !envTestKeySecret || !envTestKeyId.startsWith("rzp_test_")) {
        console.error("❌ Invalid or missing Razorpay Test credentials in Preview mode.");
        return res.status(500).json({ success: false, error: 'Server configuration error.' });
      }
      keyId = envTestKeyId;
      secret = envTestKeySecret;
    } else {
      const envKeyId = (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^["']|["']$/g, '');
      const envKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/^["']|["']$/g, '');
      if (!envKeyId || !envKeySecret || !envKeyId.startsWith("rzp_live_")) {
        console.error("❌ Invalid or missing Razorpay Live credentials in Production mode.");
        return res.status(500).json({ success: false, error: 'Server configuration error.' });
      }
      keyId = envKeyId;
      secret = envKeySecret;
    }

    if (!secret) {
      console.error("❌ Razorpay key secret is missing on server.");
      return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }

    const payloadToSign = `${orderData.razorpayOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadToSign)
      .digest('hex');

    const isLengthMatch = expectedSignature.length === razorpay_signature.length;
    const isSignatureValid = isLengthMatch && crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );

    if (!isSignatureValid) {
      console.warn(`⚠️ Signature verification failed for payment: ${razorpay_payment_id}`);
      return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
    }

    // 4. Server-to-Server Razorpay API captured verification
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${secret}`).toString('base64');

    const rzpPayRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      method: 'GET',
      headers: { 'Authorization': authHeader }
    });

    if (!rzpPayRes.ok) {
      return res.status(400).json({ success: false, error: 'Failed to verify payment status with billing provider.' });
    }

    const paymentData = await rzpPayRes.json();
    if (paymentData.status !== 'captured' ||
        paymentData.captured !== true ||
        paymentData.amount !== 9900 ||
        paymentData.currency !== 'INR' ||
        paymentData.order_id !== orderData.razorpayOrderId) {
      console.warn(`⚠️ Uncaptured or incorrect payment payload summary:`, {
        id: paymentData.id,
        order_id: paymentData.order_id,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        captured: paymentData.captured
      });
      return res.status(400).json({ success: false, error: 'Payment is not captured or amount mismatch.' });
    }

    // 5. Atomic Idempotency via Firestore Transaction
    const fulfillmentDocRef = dbAdmin.collection('paymentFulfillments').doc(razorpay_payment_id);
    const candidateLicenseKey = generateLicenseKey();
    const nowIso = new Date().toISOString();

    const fulfillmentResult = await dbAdmin.runTransaction(async (transaction) => {
      const fulfillmentSnapshot = await transaction.get(fulfillmentDocRef);

      if (fulfillmentSnapshot.exists) {
        const existingData = fulfillmentSnapshot.data();
        if (existingData.firebaseUid !== authResult.uid || existingData.razorpayOrderId !== razorpay_order_id) {
          throw new Error('Fulfillment document ownership mismatch.');
        }
        return {
          licenseKey: existingData.licenseKey,
          isNewFulfillment: false
        };
      }

      const currentOrderSnapshot = await transaction.get(orderDocRef);
      if (!currentOrderSnapshot.exists) {
        throw new Error('Order snapshot missing in transaction.');
      }

      const currentOrder = currentOrderSnapshot.data();
      if (currentOrder.status === 'fulfilled') {
        if (!currentOrder.licenseKey) {
          throw new Error('Fulfilled order is missing license key.');
        }
        return {
          licenseKey: currentOrder.licenseKey,
          isNewFulfillment: false
        };
      }

      // Write 1: Create License Key document
      const licenseDocument = {
        licenseKey: candidateLicenseKey,
        firebaseUid: authResult.uid,
        email: authResult.email,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        purchaseDate: nowIso,
        maxDevices: 1,
        registeredDevices: [],
        status: "active"
      };
      transaction.set(dbAdmin.collection('licenses').doc(candidateLicenseKey), licenseDocument);

      // Write 2: Create Fulfillment tracking record
      const fulfillmentDoc = {
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        firebaseUid: authResult.uid,
        email: authResult.email,
        productId: "zero_velocity",
        amount: 9900,
        currency: "INR",
        licenseKey: candidateLicenseKey,
        fulfilledAt: FieldValue.serverTimestamp()
      };
      transaction.set(fulfillmentDocRef, fulfillmentDoc);

      // Write 3: Update Order record to fulfilled
      transaction.update(orderDocRef, {
        status: "fulfilled",
        fulfilledAt: FieldValue.serverTimestamp(),
        licenseKey: candidateLicenseKey,
        razorpayPaymentId: razorpay_payment_id
      });

      return {
        licenseKey: candidateLicenseKey,
        isNewFulfillment: true
      };
    });

    const {
      licenseKey: finalLicenseKey,
      isNewFulfillment
    } = fulfillmentResult;

    console.log(`🎉 Fulfilled license: ${finalLicenseKey} (IsNew: ${isNewFulfillment})`);

    // Dispatch email asynchronously outside the transaction only if newly fulfilled
    if (isNewFulfillment && authResult.email) {
      try {
        await sendLicenseConfirmationEmail({
          recipientEmail: authResult.email,
          customerName: orderData.customerName || authResult.displayName || null,
          licenseKey: finalLicenseKey,
          purchaseDate: nowIso,
          razorpayPaymentId: razorpay_payment_id,
          downloadUrl: process.env.CUSTOMER_DOWNLOAD_URL || "https://drive.usercontent.google.com/download?id=1Q471jVzYPJG78fZ7ibDpgiogk5rRbNgv&export=download&confirm=t"
        });
      } catch (emailErr) {
        console.error("❌ Isolated error during email dispatch attempt:", emailErr);
      }
    }

    return res.status(200).json({
      success: true,
      licenseKey: finalLicenseKey
    });

  } catch (err) {
    console.error("❌ Error during payment verification:", err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while verifying payment.'
    });
  }
}
