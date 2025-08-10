// Next.js API route for checking video generation status
const Shotstack = require('shotstack-sdk');

const defaultClient = Shotstack.ApiClient.instance;
// ✅ include '/edit/stage' to mirror your curl
defaultClient.basePath = process.env.SHOTSTACK_HOST || 'https://api.shotstack.io/edit/stage';

const DeveloperKey = defaultClient.authentications['DeveloperKey'];
DeveloperKey.apiKey = process.env.SHOTSTACK_API_KEY;

const api = new Shotstack.EditApi();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Job ID is required' });

    // You can omit opts unless you specifically need them
    const statusResponse = await api.getRender(id /*, { data: false, merged: true } */);

    // statusResponse has shape { success, response: { ... } }
    const r = statusResponse?.response || {};
    return res.status(200).json({
      success: true,
      jobId: id,
      status: r.status,
      progress: r.progress ?? 0,
      message: r.message || '',
      url: r.url || null,
      error: r.error || null,
      createdAt: r.created,
      updatedAt: r.updated
    });
  } catch (error) {
    console.error('Error checking status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
