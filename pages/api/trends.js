// pages/api/trends-to-video.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, hint: "POST categories, subcategories, region, age" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const { categories = [], subcategories = [], region = "US", age = "18-34" } = req.body || {};
    const list = (v) => (Array.isArray(v) ? v.filter(Boolean).join(", ") : String(v || ""));

    // Step 1 — Get trending ideas
    const trendPrompt = `
You are a fast, practical social trends analyst.

User inputs:
- Categories: ${list(categories)}
- Subcategories: ${list(subcategories)}
- Region: ${region}
- Age cohort: ${age}

Task:
In 8–12 concise bullet points, list what is trending *right now* for short-form video (TikTok/Shorts/Reels) that fits these inputs.
For each bullet, include:
- Trend name (sound, hashtag, format, or style)
- Why it works / the hook
- A one-line content idea
`;

    const trendsResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: "You write crisp, actionable trend notes for creators." },
          { role: "user", content: trendPrompt }
        ]
      })
    });

    const trendsData = await trendsResp.json();
    if (!trendsResp.ok) {
      return res.status(trendsResp.status).json({ error: trendsData?.error?.message || "OpenAI API error" });
    }

    const trendsText = trendsData?.choices?.[0]?.message?.content || "";
    console.log("Trends text:", trendsText);
    // Step 2 — Turn trends into AI video generation prompt
    const videoPromptReq = `
Using the following trend insights:
${trendsText}

Create a single, detailed prompt for an AI video generation model to make a viral TikTok video.

The prompt should:
- Clearly describe the visual scenes and flow
- Include the hook in first 3 seconds
- Suggest music or sound
- Suggest style, pacing, and camera angles
- Include 3–5 hashtags (no # sign)
Return only the AI video generation prompt — no extra explanation.
`;


    const videoResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.8,
        messages: [
          { role: "system", content: "You are an expert viral TikTok video prompt writer." },
          { role: "user", content: videoPromptReq }
        ]
      })
    });

    const videoData = await videoResp.json();
    if (!videoResp.ok) {
      return res.status(videoResp.status).json({ error: videoData?.error?.message || "OpenAI API error" });
    }

    const finalPrompt = videoData?.choices?.[0]?.message?.content || "";
    console.log("Final video generation prompt:", finalPrompt);
    // Return only the final AI video generation prompt
    return res.status(200).json({ result: finalPrompt });
  } catch (err) {
    console.error("Trends-to-video endpoint error:", err);
    return res.status(500).json({ error: err?.message || "Unexpected error" });
  }
}
