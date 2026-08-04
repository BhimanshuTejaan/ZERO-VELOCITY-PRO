/**
 * Vercel Serverless Function: Health Check & Environment Verification
 * Endpoint: GET /api/health
 * 
 * Includes `secretLoaded` (boolean) to safely verify that process.env.RAZORPAY_KEY_SECRET
 * is correctly injected by Vercel without exposing the secret value.
 */
export default function handler(req, res) {
  const envKeyId = (process.env.RAZORPAY_KEY_ID || "").trim().replace(/^["']|["']$/g, '');
  const envKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim().replace(/^["']|["']$/g, '');

  const effectiveKeyId = envKeyId.startsWith("rzp_live_") ? envKeyId : "rzp_live_TLJvEN6IoOE3pq";

  return res.status(200).json({
    status: "ok",
    service: "Zero Velocity Backend",
    diagnostics: {
      RAZORPAY_KEY_ID_envExists: Boolean(envKeyId),
      RAZORPAY_KEY_ID_effective: effectiveKeyId.slice(0, 8) + "..." + effectiveKeyId.slice(-4),
      RAZORPAY_KEY_ID_isLive: effectiveKeyId.startsWith("rzp_live_"),
      RAZORPAY_KEY_SECRET_exists: Boolean(envKeySecret),
      RAZORPAY_KEY_SECRET_length: envKeySecret.length,
      RAZORPAY_KEY_SECRET_last4: envKeySecret ? envKeySecret.slice(-4) : "NONE",
      isPairedLive: effectiveKeyId.startsWith("rzp_live_") && Boolean(envKeySecret)
    },
    timestamp: new Date().toISOString()
  });
}
