// app/api/channels/connect/google/callback/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import EmailAccount from "@/models/EmailAccount";
import { getDataFromToken } from "@/lib/getDataFromToken"; // You need a way to know which user is connecting
import axios from "axios";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Google will redirect here with ?code=...
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    if (!code) {
      // No code? Possibly user denied consent.
      return NextResponse.redirect("https://crm.zapllo.com/settings/channels");
    }

    // We need to know which user is connecting. If your app is purely token-based, you might store the user's token in a cookie. 
    // We'll do a simpler approach: e.g., a custom cookie or you do the "getDataFromToken" from the request if you stored it that way.
    // For illustration, let's do:
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.redirect("https://crm.zapllo.com/settings/channels");
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.redirect("https://crm.zapllo.com/settings/channels");
    }

    // Exchange code for tokens
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://crm.zapllo.com/api/channels/connect/google/callback",
        grant_type: "authorization_code",
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const { access_token, refresh_token, id_token, expires_in } = tokenRes.data;

    // If needed, fetch user info from Google to confirm email
    const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const googleEmail = userInfoRes.data.email;

    console.log("Retrieved code:", code);
    console.log("User ID from token:", userId);
    console.log("Found user:", user);
    console.log("Token response:", tokenRes.data);
    console.log("Google user info:", userInfoRes.data);
    // Store in DB
    const account = await EmailAccount.findOneAndUpdate(
      {
        userId,
        provider: "google",
      },
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        emailAddress: googleEmail,
      },
      { upsert: true, new: true }
    );
    // Add debugging to check if account was created
    console.log("Created/Updated Email Account:", account);


    // Redirect back to Channels page
    return NextResponse.redirect("https://crm.zapllo.com/settings/channels");
  } catch (error) {
    console.error("Error in Google callback:", error);
    return NextResponse.redirect("https://crm.zapllo.com/settings/channels");
  }
}
