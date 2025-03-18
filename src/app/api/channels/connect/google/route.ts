// app/api/channels/connect/google/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // 1) Build the Google OAuth URL with your client_id, redirect_uri, scope, etc.
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    "http://localhost:3000/api/channels/connect/google/callback"
  );
  const scope = "https://www.googleapis.com/auth/userinfo.email https://mail.google.com/";
  // Add offline access if you want refresh token

  // 2) Redirect user to Google’s consent screen
  const oauthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` + // to get refresh token
    `&prompt=consent`;       // force new token each time

  return NextResponse.redirect(oauthUrl);
}
