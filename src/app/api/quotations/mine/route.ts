import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import QuotationModel from "@/models/quotationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // 1. Get userId from token
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user from DB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organization) {
      return NextResponse.json({ error: "Missing organization" }, { status: 400 });
    }

    // Get search params
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "0");
    
    // Build query - only quotations created by this user
    const query: any = {
      organization: user.organization,
      creator: userId
    };
    
    // Add status filter if provided and not "All"
    if (status && status !== "All") {
      query.status = status;
    }
    
    // Execute query with pagination
    const totalQuotations = await QuotationModel.countDocuments(query);
    const quotations = await QuotationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate("lead", "title leadId")
      .populate("contact", "firstName lastName email whatsappNumber")
      .populate("creator", "firstName lastName");
    
    return NextResponse.json({
      quotations,
      pagination: {
        total: totalQuotations,
        pages: Math.ceil(totalQuotations / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching my quotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}