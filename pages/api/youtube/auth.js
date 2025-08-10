// pages/api/youtube/auth.js
export default async function handler(req, res) {
  const { YT_CLIENT_ID, YT_CLIENT_SECRET } = process.env;
  if (!YT_CLIENT_ID || !YT_CLIENT_SECRET) {
    return res.status(500).json({ error: "Missing YT_CLIENT_ID / YT_CLIENT_SECRET" });
  }

  const origin = req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || "";
  const redirectUri = process.env.YT_REDIRECT_URI || `${origin}/api/youtube/callback`;
  const returnTo = req.query.returnTo || "/";

  const { google } = require("googleapis");
  const oauth2Client = new google.auth.OAuth2(YT_CLIENT_ID, YT_CLIENT_SECRET, redirectUri);

  const scope = ["https://www.googleapis.com/auth/youtube.upload"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope,
    state: Buffer.from(String(returnTo)).toString("base64"),
  });

  res.redirect(url);
}
