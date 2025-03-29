import { NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: Request) {
  console.log("=== STARTING GOOGLE OAUTH FLOW ===");
  
  try {
    // Get the user ID from token
    const userId = getDataFromToken(request);
    console.log("User ID before OAuth flow:", userId);
    
    if (!userId) {
      console.error("No user ID found in token when starting OAuth flow");
      return NextResponse.redirect(new URL("/login?callbackUrl=/settings/integrations/google", request.url));
    }
    
    // Get the base URL for the redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (request.headers.get("host") ? 
      `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}` : 
      "https://crm.zapllo.com");
    
    // Create a state parameter that includes the user ID
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    
    // Build the redirect URI - NO userId in query string for security
    const redirectUri = `${baseUrl}/api/channels/connect/google/callback`;
    console.log("Using redirect URI:", redirectUri);
    
    // Get the client ID
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      console.error("Missing GOOGLE_CLIENT_ID environment variable");
      return NextResponse.redirect(new URL("/settings/integrations/google?error=missing_client_id", request.url));
    }
    
    // Define the required scopes
    const scope = encodeURIComponent(
      "https://www.googleapis.com/auth/userinfo.email " +
      "https://www.googleapis.com/auth/gmail.send"
    );
    
    // Construct the full OAuth URL with state parameter containing userId
    const oauthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&state=${encodeURIComponent(state)}` + // Pass userId in state
      `&access_type=offline` + 
      `&prompt=consent` +
      `&include_granted_scopes=true`;
    
    console.log("OAuth URL generated, redirecting to Google");
    
    // Redirect the user to Google's consent screen
    return NextResponse.redirect(oauthUrl);
  } catch (error: any) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.redirect(new URL("/settings/integrations/google?error=" + encodeURIComponent(error.message || "unknown_error"), request.url));
  }
}