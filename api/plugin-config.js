/**
 * Vercel Serverless Function: Zero Velocity plugin remote config
 * Endpoint: GET /api/plugin-config
 *
 * Plain data only. This endpoint must never serve executable code, CSS, or HTML.
 */
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  return res.status(200).json({
    latestVersion: '1.0.0',
    updateEnabled: false,
    updateTitle: 'Zero Velocity Update',
    updateMessage: '',
    updateUrl: '',
    announcementId: '',
    socialHandle: '@grounded_bhim',
    socialUrl: 'https://instagram.com/grounded_bhim'
  });
}
