import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Call from "@/models/callModel";
import Wallet from "@/models/walletModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";

// Simple example that just creates the call record, checks wallet, etc.
export async function POST(req: NextRequest) {
  try {
    const userId = getDataFromToken(req);
    const user = await User.findById(userId);
    if (!user?.organization) {
      return NextResponse.json({ error: "User organization not found" }, { status: 403 });
    }

    const { contactId, leadId, phoneNumber, direction } = await req.json();
    if (!contactId || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Check wallet
    const wallet = await Wallet.findOne({ organizationId: user.organization });
    if (!wallet || wallet.balance < 50) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 403 });
    }

    // Create record
    const call = new Call({
      organizationId: user.organization,
      userId,
      contactId,
      leadId: leadId || null,
      twilioCallSid: "pending", // We'll fill later from TwiML or the webhook
      phoneNumber,
      duration: 0,
      direction: direction || "outbound",
      status: "initiated",
      cost: 0,
      startTime: new Date()
    });

    await call.save();

    return NextResponse.json({
      success: true,
      message: "Call record created",
      call
    });
  } catch (err: any) {
    console.error("Create call error:", err);
    return NextResponse.json(
      { error: "Failed to create call record", details: err.message },
      { status: 500 }
    );
  }
}
