export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SHOTSTACK_API_KEY = process.env.SHOTSTACK_API_KEY;
  if (!SHOTSTACK_API_KEY) {
    return res.status(500).json({ error: 'Missing SHOTSTACK_API_KEY env' });
  }

  const SHOTSTACK_BASE = process.env.SHOTSTACK_BASE || 'https://api.shotstack.io/edit/stage';

  // Hardcoded payload
  const payload = {
    timeline: {
      tracks: [
        {
          clips: [
            {
              asset: {
                type: "text",
                text: "Welcome to Shotstack",
                font: {
                  family: "Clear Sans",
                  color: "#ffffff",
                  size: 46
                },
                alignment: { horizontal: "left" },
                width: 566,
                height: 70
              },
              start: 4,
              length: "end",
              transition: { in: "fade", out: "fade" },
              offset: { x: -0.15, y: 0 },
              effect: "zoomIn"
            }
          ]
        },
        {
          clips: [
            {
              asset: {
                type: "video",
                src: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/footage/earth.mp4",
                trim: 5,
                volume: 1
              },
              start: 0,
              length: "auto",
              transition: { in: "fade", out: "fade" }
            }
          ]
        },
        {
          clips: [
            {
              asset: {
                type: "audio",
                src: "https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/freepd/motions.mp3",
                effect: "fadeOut",
                volume: 1
              },
              start: 0,
              length: "end"
            }
          ]
        }
      ]
    },
    output: {
      format: "mp4",
      size: { width: 1280, height: 720 }
    }
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const resp = await fetch(`${SHOTSTACK_BASE}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHOTSTACK_API_KEY
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout));

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: 'Shotstack render error',
        status: resp.status,
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      shotstackId: data?.response?.id || data?.id,
      status: data?.response?.status || data?.status || 'submitted',
      payloadSent: payload
    });

  } catch (err) {
    const isAbort = err?.name === 'AbortError';
    return res.status(500).json({
      error: isAbort ? 'Shotstack request timed out' : 'Internal server error',
      message: err?.message || String(err)
    });
  }
}
