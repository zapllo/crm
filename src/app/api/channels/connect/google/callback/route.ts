import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import EmailAccount from "@/models/EmailAccount";
import axios from "axios";

export async function GET(request: Request) {
  console.log("=== CALLBACK ROUTE STARTED ===");
  try {
    await connectDB();

    // Get the authorization code from Google
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const stateParam = searchParams.get("state");
    
    console.log("Authorization code:", code ? "Received" : "Missing");
    console.log("Error from Google:", error || "None");
    
    if (error) {
      console.error("Google auth error:", error);
      return NextResponse.redirect(new URL("/settings/integrations/google?error=" + encodeURIComponent(error), request.url));
    }
    
    if (!code) {
      console.error("No code received from Google");
      return NextResponse.redirect(new URL("/settings/integrations/google?error=no_code", request.url));
    }
    
    if (!stateParam) {
      console.error("No state parameter received");
      return NextResponse.redirect(new URL("/settings/integrations/google?error=no_state", request.url));
    }
    
    // Decode state to get userId
    let state;
    try {
      state = JSON.parse(Buffer.from(decodeURIComponent(stateParam), 'base64').toString());
    } catch (e) {
      console.error("Error decoding state:", e);
      return NextResponse.redirect(new URL("/settings/integrations/google?error=invalid_state", request.url));
    }
    
    // Get userId from state
    const userId = state.userId;
    console.log("User ID from state:", userId || "Not found");
    
    if (!userId) {
      console.error("No user ID found in state");
      return NextResponse.redirect(new URL("/settings/integrations/google?error=missing_user_id", request.url));
    }

    // Find the user
    const user = await User.findById(userId);
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      console.error("User not found in database");
      return NextResponse.redirect(new URL("/settings/integrations/google?error=user_not_found", request.url));
    }

    // Get your app's domain for the redirect URI
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (request.headers.get("host") ? 
      `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host")}` : 
      "https://crm.zapllo.com");
      
    const redirectUri = `${baseUrl}/api/channels/connect/google/callback`;
    console.log("Using redirect URI:", redirectUri);

    // Exchange the authorization code for tokens
    console.log("Exchanging code for tokens...");
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    console.log("Token response status:", tokenResponse.status);
    
    const { access_token, refresh_token } = tokenResponse.data;
    console.log("Access token received:", access_token ? "Yes" : "No");
    console.log("Refresh token received:", refresh_token ? "Yes" : "No");
    
    if (!access_token) {
      console.error("No access token received");
      return NextResponse.redirect(new URL("/settings/integrations/google?error=no_access_token", request.url));
    }

    // Get user's email from Google API
    console.log("Getting user info from Google...");
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { email } = userInfoResponse.data;
    console.log("User email from Google:", email);

    if (!email) {
      console.error("No email found in Google user info");
      return NextResponse.redirect(new URL("/settings/integrations/google?error=no_email", request.url));
    }

    // Store the tokens in your database
    console.log("Saving email account to database...");
    console.log("User ID for DB save:", userId);
    
    const emailAccount = await EmailAccount.findOneAndUpdate(
      { userId, provider: "google" },
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        emailAddress: email
      },
      { upsert: true, new: true }
    );

    console.log("Email account saved:", emailAccount._id ? "Success" : "Failed");

    // Return to the Google integration page with success message
    return NextResponse.redirect(new URL("/settings/integrations/google?success=true", request.url));
  } catch (error: any) {
    console.error("Error in Google callback:", error);
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    
    // Return to the Google integration page with error
    return NextResponse.redirect(new URL("/settings/integrations/google?error=" + encodeURIComponent(error.message || "unknown_error"), request.url));
  }
}