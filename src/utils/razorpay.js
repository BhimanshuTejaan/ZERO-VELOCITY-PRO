// ─────────────────────────────────────────────────────────
// Zero Velocity – Razorpay LIVE MODE Configuration
// ─────────────────────────────────────────────────────────

// Live Key ID (public – safe to embed in client bundle)
// Live Key Secret is stored exclusively in Vercel environment variables (RAZORPAY_KEY_SECRET)
export const RAZORPAY_KEY_ID = "rzp_live_TLJvEN6IoOE3pq";

// Temporary test price: ₹1 (100 paise)
export const PRODUCT_PRICE_INR = 1;

// ─────────────────────────────────────────────────────────
// Customer Download URL – Zero_Velocity_v1.0.0.zip
// Direct download via Google Drive (bypasses virus-scan interstitial)
// ─────────────────────────────────────────────────────────
export const CUSTOMER_DOWNLOAD_URL = "https://drive.usercontent.google.com/download?id=1DxHIyrEM4BQxO5YSHvQt9a9lQWDSmXB8&export=download&confirm=t";

/**
 * Dynamically loads the Razorpay Checkout SDK script if not already present.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Opens the Razorpay Checkout popup (production).
 * 1. Creates an Order ID on server via /api/create-order.
 * 2. Launches Razorpay Checkout modal attached to the created order.
 * 3. On success, verifies HMAC signature & stores license via /api/verify-payment.
 * 4. Dispatches zero-velocity-license-issued event with licenseKey + downloadUrl.
 */
export const initiateRazorpayCheckout = async ({ currentUser, onSuccess, onError }) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert("Failed to load Razorpay SDK. Please check your internet connection.");
    if (onError) onError(new Error("SDK script load failed"));
    return;
  }

  // Step 1: Create Order ID on backend to fix unanchored/international card restrictions
  let orderData = null;
  try {
    const amountInPaise = PRODUCT_PRICE_INR * 100;
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInPaise })
    });

    const resJson = await orderRes.json();
    if (!resJson.success || !resJson.order) {
      throw new Error(resJson.error || "Could not create Razorpay order");
    }
    orderData = resJson.order;
  } catch (orderErr) {
    console.error("❌ Order Creation Error:", orderErr);
    alert(`Payment initialization failed: ${orderErr.message}`);
    if (onError) onError(orderErr);
    return;
  }

  // Step 2: Configure Checkout with official order_id
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: orderData.amount, // from server order
    currency: orderData.currency, // INR
    order_id: orderData.id, // Official Razorpay Order ID
    name: "Zero Velocity",
    description: "Zero Velocity Version 1.0 (Founder Launch)",
    image: "/cep/assets/zero-velocity-logo.png",
    prefill: {
      name: currentUser?.displayName || "",
      email: currentUser?.email || ""
    },
    theme: {
      color: "#3b82f6"
    },
    handler: async function (response) {
      console.log("✅ Razorpay Payment Success Response:", response);

      // Trigger full-screen processing overlay immediately after Razorpay reports success
      window.dispatchEvent(new CustomEvent('zero-velocity-payment-processing-start'));
      const startTime = performance.now();

      const verifyPayload = {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id || orderData.id,
        razorpay_signature: response.razorpay_signature || "",
        firebaseUid: currentUser?.uid || null,
        email: currentUser?.email || null,
        customerName: currentUser?.displayName || null
      };

      // Step 3: Verify HMAC signature and store license in Firestore
      try {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(verifyPayload)
        });

        const data = await verifyRes.json();
        const duration = Math.round(performance.now() - startTime);

        if (data.success) {
          console.log(`⏱️ Payment Verification Processing Duration: ${duration} ms`);
          console.log("🎉 License Created & Stored in Firestore:", data.licenseKey);
          
          // Notify overlay of success
          window.dispatchEvent(new CustomEvent('zero-velocity-payment-processing-success', {
            detail: { licenseKey: data.licenseKey, duration }
          }));

          // Automatically pop open the License Modal with download URL
          window.dispatchEvent(new CustomEvent('zero-velocity-license-issued', {
            detail: {
              licenseKey: data.licenseKey,
              downloadUrl: CUSTOMER_DOWNLOAD_URL || null
            }
          }));

          if (onSuccess) onSuccess({ ...response, licenseKey: data.licenseKey });
        } else {
          console.error(`⏱️ Payment Verification Failed after ${duration} ms:`, data.error);
          
          // Notify overlay of failure and attach retry payload
          window.dispatchEvent(new CustomEvent('zero-velocity-payment-processing-error', {
            detail: { 
              error: data.error || "Payment signature verification failed.",
              retryPayload: verifyPayload
            }
          }));

          if (onError) onError(new Error(data.error));
        }
      } catch (verifyErr) {
        const duration = Math.round(performance.now() - startTime);
        console.error(`⏱️ Error contacting verification API after ${duration} ms:`, verifyErr);
        
        window.dispatchEvent(new CustomEvent('zero-velocity-payment-processing-error', {
          detail: { 
            error: "Payment completed, but verification server failed to respond. Please click Retry.",
            retryPayload: verifyPayload
          }
        }));

        if (onError) onError(verifyErr);
      }
    },
    modal: {
      ondismiss: function () {
        console.log("ℹ️ Razorpay Checkout popup closed by user.");
        if (onError) onError(new Error("Payment cancelled by user"));
      }
    }
  };

  const razorpayInstance = new window.Razorpay(options);
  razorpayInstance.on("payment.failed", function (response) {
    console.error("❌ Razorpay Payment Failed:", response.error);
    alert(`Payment Failed: ${response.error.description || "Transaction could not be completed."}`);
    if (onError) onError(response.error);
  });

  razorpayInstance.open();
};
