/**
 * Vercel Serverless Function: Health Check Endpoint
 * Endpoint: GET /api/health
 *
 * Minimal status validation without exposing secret credentials or metadata.
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "ok",
    service: "Zero Velocity Backend"
  });
}
