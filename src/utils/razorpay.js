// ─────────────────────────────────────────────────────────
// Zero Velocity – Razorpay LIVE MODE Configuration
// ─────────────────────────────────────────────────────────

// Live Key ID (public – safe to embed in client bundle)
// Live Key Secret is stored exclusively in Vercel environment variables (RAZORPAY_KEY_SECRET)
export const RAZORPAY_KEY_ID = "rzp_live_TLJvEN6IoOE3pq";

// Launch price: ₹99 (9900 paise)
export const PRODUCT_PRICE_INR = 99;

// ─────────────────────────────────────────────────────────
// Customer Download URL – ZeroVelocity v.1.2.zip
// Direct download via Google Drive (bypasses virus-scan interstitial)
// ─────────────────────────────────────────────────────────
export const CUSTOMER_DOWNLOAD_URL = "https://drive.usercontent.google.com/download?id=1dG_Wla6yz9A8GotwFvVaa37XnoFL_eFu&export=download&confirm=t";

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
  let keyIdFromServer = null;
  try {
    const token = await currentUser.getIdToken();
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: "zero_velocity" })
    });

    const resJson = await orderRes.json();
    if (!orderRes.ok || !resJson.success || !resJson.order) {
      throw new Error(resJson.error || "Could not create Razorpay order");
    }
    orderData = resJson.order;
    keyIdFromServer = resJson.keyId;
  } catch (orderErr) {
    console.error("❌ Order Creation Error:", orderErr);
    alert(`Payment initialization failed: ${orderErr.message}`);
    if (onError) onError(orderErr);
    return;
  }

  // Step 2: Configure Checkout with official order_id
  const options = {
    key: keyIdFromServer || RAZORPAY_KEY_ID,
    amount: orderData.amount, // from server order
    currency: orderData.currency, // INR
    order_id: orderData.id, // Official Razorpay Order ID
    name: "Zero Velocity",
    description: "Zero Velocity Version 1.2",
    image: typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/cep/assets/zero-velocity-logo.png`
      : "https://www.zerovelocitycaptions.com/cep/assets/zero-velocity-logo.png",
    notes: {
      website: typeof window !== 'undefined' ? window.location.origin : "https://www.zerovelocitycaptions.com",
      order_id: orderData.id
    },
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
        razorpay_signature: response.razorpay_signature || ""
      };

      // Step 3: Verify HMAC signature and store license in Firestore
      try {
        const token = await currentUser.getIdToken();
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
        restoreBodyScroll();
        setTimeout(restoreBodyScroll, 50);
        setTimeout(restoreBodyScroll, 250);
        setTimeout(restoreBodyScroll, 750);
        if (onError) onError(new Error("Payment cancelled by user"));
      },
      onhidden: function () {
        restoreBodyScroll();
      }
    }
  };

  const razorpayInstance = new window.Razorpay(options);
  razorpayInstance.on("payment.failed", function (response) {
    restoreBodyScroll();
    console.error("❌ Razorpay Payment Failed:", response.error);
    alert(`Payment Failed: ${response.error.description || "Transaction could not be completed."}`);
    if (onError) onError(response.error);
  });

  // Watchdog: detect when modal closes or is removed to guarantee scroll restoration
  const watchdog = setInterval(() => {
    const container = document.querySelector('.razorpay-container');
    if (!container || container.style.display === 'none') {
      clearInterval(watchdog);
      restoreBodyScroll();
    }
  }, 300);

  // Clear watchdog after 30 minutes to prevent resource leak
  setTimeout(() => clearInterval(watchdog), 30 * 60 * 1000);

  razorpayInstance.open();
};

/**
 * Restores body and document scroll state if locked by Razorpay Checkout.
 * Strips inline overflow/contain locks, cleans up hidden modal containers,
 * and restores focus to window to re-enable scroll wheel and keyboard navigation.
 */
export const restoreBodyScroll = () => {
  try {
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('contain');
    document.documentElement.style.removeProperty('overflow');
    document.documentElement.style.removeProperty('contain');

    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
    if (document.documentElement.style.overflow === 'hidden') {
      document.documentElement.style.overflow = '';
    }

    // Clean up any hidden or orphaned razorpay containers
    const containers = document.querySelectorAll('.razorpay-container');
    containers.forEach((container) => {
      if (container.style.display === 'none' || !container.offsetParent) {
        container.remove();
      }
    });

    // Reset focus if trapped in iframe or container
    if (document.activeElement && (document.activeElement.tagName === 'IFRAME' || document.activeElement.closest?.('.razorpay-container'))) {
      document.activeElement.blur();
      window.focus();
    }
  } catch (err) {
    console.warn('⚠️ Scroll restoration notice:', err);
  }
};
