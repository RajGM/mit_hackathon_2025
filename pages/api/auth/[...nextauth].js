// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

async function refreshAccessToken(token) {
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refresh_token,
      }),
    });
    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      access_token: refreshed.access_token,
      expires_at: Math.floor(Date.now() / 1000) + (refreshed.expires_in || 3600),
      refresh_token: refreshed.refresh_token ?? token.refresh_token,
      error: undefined,
    };
  } catch (e) {
    console.error("Error refreshing access token", e);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        // ask for YouTube upload scope + offline access
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/youtube.upload",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token; // may only be returned the first time
        token.expires_at =
          Math.floor(Date.now() / 1000) + (account.expires_in || 3600);
        return token;
      }
      // Return previous token if still valid
      if (token.expires_at && Date.now() / 1000 < token.expires_at - 60) {
        return token;
      }
      // Refresh if we have a refresh token
      if (token.refresh_token) {
        return await refreshAccessToken(token);
      }
      return token;
    },
    async session({ session, token }) {
      session.access_token = token.access_token;
      session.error = token.error;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
