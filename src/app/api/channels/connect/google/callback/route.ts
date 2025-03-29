// app/api/channels/connect/google/callback/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import EmailAccount from "@/models/EmailAccount";
import { getDataFromToken } from "@/lib/getDataFromToken";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Get the code from URL params
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    
    if (!code) {
      console.error("No code received from Google");
      return NextResponse.redirect(new URL("/settings/integrations/google", request.url));
    }

    // Get the userId from the token
    const userId = getDataFromToken(request);
    
    if (!userId) {
      console.error("No user ID found in token");
      return NextResponse.redirect(new URL("/settings/integrations/google", request.url));
    }

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found");
      return NextResponse.redirect(new URL("/settings/integrations/google", request.url));
    }

    // Set the correct redirect URI - MUST match what you have in Google Cloud Console
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://crm.zapllo.com'}/api/channels/connect/google/callback`;
    
    console.log(`Exchanging code for tokens with redirect: ${redirectUri}`);

    // Exchange the code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    if (!access_token) {
      console.error("No access token received from Google");
      return NextResponse.redirect(new URL("/settings/integrations/google", request.url));
    }

    // Get user's email from Google API
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { email } = userInfoResponse.data;

    if (!email) {
      console.error("No email found in Google user info");
      return NextResponse.redirect(new URL("/settings/integrations/google", request.url));
    }

    console.log(`Creating email account for user ${userId} with email ${email}`);

    // Create or update the email account in the database
    const emailAccount = await EmailAccount.findOneAndUpdate(
      { userId, provider: "google" },
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        emailAddress: email,
      },
      { upsert: true, new: true }
    );

    console.log("Email account saved:", emailAccount._id);

    // Redirect to the integrations page
    return NextResponse.redirect(new URL("/settings/integrations/google", request.url));
  } catch (error) {
    console.error("Error in Google callback:", error);
    // Redirect to the integrations page with error
    return NextResponse.redirect(new URL("/settings/integrations/google?error=true", request.url));
  }
}