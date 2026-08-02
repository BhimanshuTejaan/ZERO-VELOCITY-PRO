// Razorpay Test Mode Configuration
// Replace this with your Razorpay Test Key ID if needed
export const RAZORPAY_KEY_ID = "rzp_test_TKtvS0LyeIrNkb";

// TEMPORARY DEVELOPMENT / TESTING AMOUNT (in INR)
// Set to 1 for quick testing. Change PRODUCT_PRICE_INR back to 99 to switch to the real launch price.
export const PRODUCT_PRICE_INR = 1;

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
 * Opens the Razorpay Checkout popup for testing payment.
 * 1. Creates an Order ID on server via /api/create-order.
 * 2. Launches Razorpay Checkout modal attached to the created order.
 * 3. On success, verifies signature & stores license via /api/verify-payment.
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

      // Step 3: Verify HMAC signature and store license in Firestore
      try {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || orderData.id,
            razorpay_signature: response.razorpay_signature || "",
            firebaseUid: currentUser?.uid || null,
            email: currentUser?.email || null
          })
        });

        const data = await verifyRes.json();

        if (data.success) {
          console.log("🎉 License Created & Stored in Firestore:", data.licenseKey);
          
          // Dispatch global custom event so LicenseModal pops open automatically
          window.dispatchEvent(new CustomEvent('zero-velocity-license-issued', {
            detail: { licenseKey: data.licenseKey }
          }));

          if (onSuccess) onSuccess({ ...response, licenseKey: data.licenseKey });
        } else {
          console.error("⚠️ Payment verification failed:", data.error);
          alert(`⚠️ Payment Verification Failed: ${data.error || "Verification error"}`);
          if (onError) onError(new Error(data.error));
        }
      } catch (verifyErr) {
        console.error("❌ Error contacting verification API:", verifyErr);
        alert("Payment completed, but verification endpoint failed to respond.");
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
