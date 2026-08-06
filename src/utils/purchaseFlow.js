import { initiateRazorpayCheckout } from "./razorpay";

/**
 * Step 1: Check authentication state
 */
export function checkAuth(currentUser) {
  return !!currentUser;
}

/**
 * Step 2: Ensure user is signed in.
 * If user is already signed in, returns currentUser immediately.
 * If user is not signed in, triggers Google Sign-In popup.
 * Returns authenticated user object, or null if auth failed/cancelled.
 */
export async function signInIfNeeded({ currentUser, loginWithGoogle }) {
  if (checkAuth(currentUser)) {
    return currentUser;
  }

  try {
    const result = await loginWithGoogle();
    return result?.user || null;
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      console.log("ℹ️ User closed Google Sign-In popup. Purchase flow stopped gracefully.");
      return null;
    }
    console.error("❌ Authentication error during purchase flow:", error);
    alert(`Sign in failed: ${error.message || "Authentication error"}`);
    return null;
  }
}

/**
 * Step 3: Open Razorpay Checkout for authenticated user
 */
export async function openRazorpayCheckoutForUser(user, { onSuccess, onError } = {}) {
  if (!user) return;
  
  await initiateRazorpayCheckout({
    currentUser: user,
    onSuccess: (paymentResponse) => {
      /*
       * FUTURE STEP EXTENSIONS:
       * 1. Verify payment signature on backend.
       * 2. Generate unique license key.
       * 3. Store license & payment ID in Firebase.
       * 4. Update user dashboard.
       */
      if (onSuccess) onSuccess(paymentResponse);
    },
    onError: (paymentError) => {
      if (onError) onError(paymentError);
    }
  });
}

/**
 * Master purchase flow pipeline:
 * Click "Buy Now" -> Check Auth -> Sign In (if needed) -> Auto Open Razorpay
 */
export async function executePurchaseFlow({ currentUser, loginWithGoogle, onSuccess, onError }) {
  alert("Zero Velocity is temporarily unavailable while a stability update is being deployed.");
  return;
}
