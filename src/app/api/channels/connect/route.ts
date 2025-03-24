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

    // 1) Extract user
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({}, { status: 200 }); // Not connected, or just return empty
    }

    // 2) Validate user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({}, { status: 200 });
    }

    // 3) Find existing account
    const account = await EmailAccount.findOne({
      userId: userId,
      provider: "google",
    }).lean();

    if (!account) {
      return NextResponse.json({}, { status: 200 }); // no connected account
    }

    // Return minimal info to the Channels page
    return NextResponse.json({
      emailAddress: (account as any).email || (account as any).emailAddress || '',
      createdAt: (account as any).createdAt || new Date(),
    });
  } catch (error) {
    console.error("Error in GET /api/channels/connect:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
