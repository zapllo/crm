import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import QuotationModel from "@/models/quotationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get userId from token
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user from DB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organization) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // Get leadId from query params
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    // Build query
    const query: any = {
      organization: user.organization,
      lead: leadId
    };

    // Execute query
    const quotations = await QuotationModel.find(query)
      .sort({ createdAt: -1 })
      .populate("creator", "firstName lastName")
      .populate("contact", "firstName lastName email")
      .select("quotationNumber title status total currency issueDate validUntil createdAt updatedAt");

    return NextResponse.json({ quotations });
  } catch (error) {
    console.error("Error fetching lead quotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}