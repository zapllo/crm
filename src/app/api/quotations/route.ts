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

    // Build query
    const query: any = {
      organization: user.organization,
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
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = getDataFromToken(req);
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    
    // Fix: Handle notes field properly
    let processedNotes = [];
    if (body.notes && typeof body.notes === 'string' && body.notes.trim()) {
      processedNotes = [{
        content: body.notes.trim(),
        createdBy: userId,
        timestamp: new Date(),
      }];
    } else if (Array.isArray(body.notes)) {
      processedNotes = body.notes;
    }

    // Generate quotation number if not provided
    const quotationNumber = body.quotationNumber || 
      `QUO-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    // Create quotation data
    const quotationData = {
      ...body,
      quotationNumber,
      organization: user.organization,
      creator: userId,
      lead: body.leadId, // Map leadId to lead
      contact: body.contactId, // Map contactId to contact
      notes: processedNotes, // Use processed notes array
      // Remove the mapped fields to avoid confusion
      leadId: undefined,
      contactId: undefined,
    };

    // Clean up undefined fields
    Object.keys(quotationData).forEach(key => {
      if (quotationData[key] === undefined) {
        delete quotationData[key];
      }
    });

    const quotation = new QuotationModel(quotationData);
    const savedQuotation = await quotation.save();

    // Populate the saved quotation with referenced documents
    const populatedQuotation = await QuotationModel.findById(savedQuotation._id)
      .populate('organization', 'companyName logo additionalLogos industry email phone address')
      .populate('creator', 'firstName lastName email')
      .populate('lead', 'title leadId')
      .populate('contact', 'firstName lastName email whatsappNumber')
      .lean();

    return NextResponse.json(populatedQuotation, { status: 201 });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 500 }
    );
  }
}