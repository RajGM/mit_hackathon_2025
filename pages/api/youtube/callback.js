// pages/api/youtube/callback.js
import cookie from "cookie";

export default async function handler(req, res) {
  const { code, state } = req.query;
  const { YT_CLIENT_ID, YT_CLIENT_SECRET } = process.env;

  if (!code) return res.status(400).send("Missing code");
  if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) return res.status(500).send("Missing client creds");

  const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "";
  const redirectUri = process.env.YT_REDIRECT_URI || `${origin}/api/youtube/callback`;
  const { google } = require("googleapis");
  const oauth2Client = new google.auth.OAuth2(YT_CLIENT_ID, YT_CLIENT_SECRET, redirectUri);

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens in an httpOnly cookie (for demo). In prod, store server-side.
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("yt_tokens", JSON.stringify(tokens), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    );

    const returnTo = state ? Buffer.from(String(state), "base64").toString("utf8") : "/video";
    res.redirect(returnTo);
  } catch (e) {
    console.error(e);
    res.status(500).send("OAuth failed");
  }
}
