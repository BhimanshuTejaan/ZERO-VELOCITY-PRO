/**
 * Vercel Serverless Function: Health Check
 * Endpoint: GET /api/health
 * 
 * Purpose:
 * Simple status endpoint to confirm Vercel Serverless API routes are working properly.
 */
export default function handler(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "Zero Velocity Backend",
    timestamp: new Date().toISOString()
  });
}
