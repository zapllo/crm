import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import { Organization } from "@/models/organizationModel";
import { NextResponse } from "next/server";

// GET AI credits
export async function GET(request: Request) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }

    const organization = await Organization.findById(user.organization);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      aiCredits: organization.aiCredits,
      organizationName: organization.companyName
    });

  } catch (error) {
    console.error("Error fetching AI credits:", error);
    return NextResponse.json({ error: "Failed to fetch AI credits" }, { status: 500 });
  }
}

// POST to add AI credits (for admin or payment integration)
export async function POST(request: Request) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }

    const { credits } = await request.json();
    if (!credits || credits <= 0) {
      return NextResponse.json({ error: "Invalid credits amount" }, { status: 400 });
    }

    const organization = await Organization.findByIdAndUpdate(
      user.organization,
      { $inc: { aiCredits: credits } },
      { new: true }
    );

    return NextResponse.json({
      message: "AI credits added successfully",
      aiCredits: organization?.aiCredits
    });

  } catch (error) {
    console.error("Error adding AI credits:", error);
    return NextResponse.json({ error: "Failed to add AI credits" }, { status: 500 });
  }
}