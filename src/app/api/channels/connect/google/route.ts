// app/api/channels/connect/google/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  // Get base URL for redirect
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.zapllo.com';
  
  // Build the Google OAuth URL
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = encodeURIComponent(
    `${baseUrl}/api/channels/connect/google/callback`
  );
  
  // Request permissions for user info and Gmail API
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/userinfo.email " +
    "https://www.googleapis.com/auth/gmail.send"
  );

  // Create the OAuth URL
  const oauthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${googleClientId}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` + 
    `&prompt=consent` +
    `&include_granted_scopes=true`;

  return NextResponse.redirect(oauthUrl);
}