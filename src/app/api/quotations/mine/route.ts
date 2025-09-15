import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import QuotationModel from "@/models/quotationModel";
import { User } from "@/models/userModel";
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
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query - only quotations created by this user
    const query: any = {
      organization: user.organization,
      creator: userId, // Only quotations created by this user
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    // Execute query with pagination
    const totalQuotations = await QuotationModel.countDocuments(query);
    const quotations = await QuotationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .populate("lead", "title leadId amount closeDate description")
      .populate("contact", "firstName lastName email whatsappNumber address city state country pincode")
      .populate("creator", "firstName lastName");

    return NextResponse.json({
      quotations,
      pagination: {
        page,
        limit,
        total: totalQuotations,
        totalPages: Math.ceil(totalQuotations / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user quotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}