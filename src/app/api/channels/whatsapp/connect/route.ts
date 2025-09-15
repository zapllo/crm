import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import Organization from "@/models/organizationModel";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Get userId from your custom token system
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wabaId } = await req.json();

    if (!wabaId || !wabaId.trim()) {
      return NextResponse.json({ error: "WABA ID is required" }, { status: 400 });
    }

    await connectDB();

    // Fetch the user from DB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organization) {
      return NextResponse.json({ error: "User organization not found" }, { status: 400 });
    }

    // Find organization by user's organization ID
    const organization = await Organization.findById(user.organization);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Update organization with WhatsApp integration details
    await Organization.findByIdAndUpdate(organization._id, {
      $set: {
        whatsappIntegration: {
          wabaId: wabaId.trim(),
          isConnected: true,
          connectedAt: new Date(),
          lastSyncAt: null
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "WhatsApp Business Account connected successfully",
      wabaId: wabaId.trim()
    });

  } catch (error) {
    console.error("Error connecting WABA:", error);
    return NextResponse.json(
      { error: "Failed to connect WhatsApp Business Account" },
      { status: 500 }
    );
  }
}