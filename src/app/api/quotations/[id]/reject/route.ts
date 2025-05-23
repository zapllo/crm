import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Quotation from "@/models/quotationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";

export async function POST(request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    await connectDB();
    const body = await request.json();
    const { reason } = body;

    // 1. Get userId from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user from DB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organization) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // 3. Find and update the quotation
    const quotation = await Quotation.findOne({
      _id: id,
      organization: user.organization,
    });

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // 4. Update quotation status
    quotation.status = 'rejected';

    // 5. Add to approval history
    quotation.approvalHistory.push({
      status: 'revision_requested',
      comment: reason,
      updatedBy: userId as any,
      timestamp: new Date()
    });

    await quotation.save();

    return NextResponse.json({ success: true, quotation });
  } catch (error) {
    console.error("Error rejecting quotation:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}