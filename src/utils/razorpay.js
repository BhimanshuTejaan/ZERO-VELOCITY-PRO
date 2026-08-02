// Razorpay Test Mode Configuration
// Replace this with your Razorpay Test Key ID if needed
export const RAZORPAY_KEY_ID = "rzp_test_TKtvS0LyeIrNkb";

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
 * Opens the Razorpay Checkout popup for ₹99 test payment.
 * Prefills user name & email from Firebase if available.
 */
export const initiateRazorpayCheckout = async ({ currentUser, onSuccess, onError }) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert("Failed to load Razorpay SDK. Please check your internet connection.");
    if (onError) onError(new Error("SDK script load failed"));
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: 9900, // ₹99 in paise (99 * 100)
    currency: "INR",
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
    handler: function (response) {
      console.log("✅ Razorpay Payment Success Response:", response);
      alert(`🎉 Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
      if (onSuccess) onSuccess(response);
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
