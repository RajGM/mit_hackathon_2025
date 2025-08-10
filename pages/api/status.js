// Next.js API route for checking video generation status
const Shotstack = require('shotstack-sdk');

// Initialize Shotstack client
const defaultClient = Shotstack.ApiClient.instance;
defaultClient.basePath = process.env.SHOTSTACK_HOST || 'https://api.shotstack.io/stage';

const DeveloperKey = defaultClient.authentications['DeveloperKey'];
DeveloperKey.apiKey = process.env.SHOTSTACK_API_KEY;

const api = new Shotstack.EditApi();

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Get status from Shotstack using the proper SDK method
    const statusResponse = await api.getRender(id, { data: false, merged: true });
    console.log('Shotstack status response:', statusResponse);

    const response = {
      success: true,
      jobId: id,
      status: statusResponse.response.status,
      progress: statusResponse.response.progress || 0,
      message: statusResponse.response.message || '',
      url: statusResponse.response.url || null,
      error: statusResponse.response.error || null,
      createdAt: statusResponse.response.created,
      updatedAt: statusResponse.response.updated
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Error checking status:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
