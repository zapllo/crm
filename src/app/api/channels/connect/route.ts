// app/api/channels/connect/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import EmailAccount from "@/models/EmailAccount";

// GET: Check if the user has a connected Google account
export async function GET(request: Request) {
  try {
    await connectDB();

    // Extract user
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({}, { status: 200 });
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({}, { status: 200 });
    }

    // Find existing account
    const account = await EmailAccount.findOne({
      userId: userId,
      provider: "google",
    });

    if (!account) {
      return NextResponse.json({}, { status: 200 });
    }

    // Return email account info
    return NextResponse.json({
      emailAddress: account.emailAddress,
      createdAt: account.createdAt,
    }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/channels/connect:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a DELETE endpoint to disconnect the account
export async function DELETE(request: Request) {
  try {
    await connectDB();
    
    // Extract user
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find and delete the account
    await EmailAccount.findOneAndDelete({
      userId: userId,
      provider: "google"
    });

    return NextResponse.json({ message: "Account disconnected successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error disconnecting account:", error);
    return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 });
  }
}