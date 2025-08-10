// pages/api/generate5.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  if (!process.env.SHOTSTACK_API_KEY) {
    return res.status(500).json({ error: "Missing SHOTSTACK_API_KEY" });
  }

  // ✅ EXACT payload (unchanged)
  const payload = {
    "timeline": {
      "tracks": [
        {
          "clips": [
            {
              "asset": {
                "type": "caption",
                "src": "alias://voiceover",
                "font": {
                  "color": "#ffffff",
                  "family": "Montserrat ExtraBold",
                  "size": 30,
                  "lineHeight": 0.8
                },
                "margin": {
                  "top": 0.25
                }
              },
              "start": 0,
              "length": "end"
            }
          ]
        },
        {
          "clips": [
            {
              "alias": "voiceover",
              "asset": {
                "type": "text-to-speech",
                "text": "Good evening, in Sydney tonight we’re tracking a developing story as unexpected storms roll in across the city, bringing with them flash flooding warnings and major disruptions to the evening commute.",
                "voice": "Joanna"
              },
              "start": 0,
              "length": "auto"
            }
          ]
        }
      ]
    },
    "output": {
      "format": "mp4",
      "size": {
        "width": 1280,
        "height": 720
      }
    }
  };

  try {
    const r = await fetch("https://api.shotstack.io/edit/v1/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.SHOTSTACK_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.message || data || "Shotstack API error" });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error("generate5 error:", err);
    return res.status(500).json({ error: err?.message || "Unexpected error" });
  }
}
