// pages/api/youtube/publish.js
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { videoUrl, title, description, privacyStatus } = req.body || {};
  if (!videoUrl || !title) return res.status(400).json({ error: "Missing videoUrl or title" });

  const cookies = cookie.parse(req.headers.cookie || "");
  if (!cookies.yt_tokens) return res.status(401).json({ error: "YouTube not connected" });

  let tokens;
  try { tokens = JSON.parse(cookies.yt_tokens); } catch { return res.status(401).json({ error: "Invalid auth" }); }

  const { YT_CLIENT_ID, YT_CLIENT_SECRET } = process.env;
  if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) return res.status(500).json({ error: "Missing YT client creds" });

  try {
    const { google } = require("googleapis");
    const { Readable } = require("stream");

    const oauth2Client = new google.auth.OAuth2(YT_CLIENT_ID, YT_CLIENT_SECRET);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // stream the remote mp4 into YouTube
    const resp = await fetch(videoUrl);
    if (!resp.ok || !resp.body) return res.status(400).json({ error: "Unable to fetch video file" });

    const nodeStream = Readable.fromWeb(resp.body); // Node 18+

    const upload = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: { title, description, categoryId: "22" }, // People & Blogs
        status: { privacyStatus: privacyStatus || "unlisted" },
      },
      media: { body: nodeStream },
    });

    const videoId = upload?.data?.id;
    if (!videoId) throw new Error("No videoId returned");
    res.status(200).json({ success: true, videoId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e?.message || "Upload failed" });
  }
}
