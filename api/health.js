/**
 * Vercel Serverless Function: Health Check & Environment Verification
 * Endpoint: GET /api/health
 * 
 * Includes `secretLoaded` (boolean) to safely verify that process.env.RAZORPAY_KEY_SECRET
 * is correctly injected by Vercel without exposing the secret value.
 */
export default function handler(req, res) {
  const secretLoaded = Boolean(process.env.RAZORPAY_KEY_SECRET);

  return res.status(200).json({
    status: "ok",
    service: "Zero Velocity Backend",
    secretLoaded: secretLoaded,
    timestamp: new Date().toISOString()
  });
}
