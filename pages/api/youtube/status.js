// pages/api/youtube/status.js
import cookie from "cookie";

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  const connected = Boolean(cookies.yt_tokens);
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ connected });
}
