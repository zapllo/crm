import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import QuotationModel from "@/models/quotationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function POST(req: NextRequest) {
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

    // Parse request body
    const data = await req.json();
    
    // Create new quotation object
    const quotation = new QuotationModel({
      title: data.title,
      organization: user.organization,
      creator: userId,
      lead: data.leadId,
      contact: data.contactId,
      items: data.items.map((item: any) => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 0,
        total: item.total
      })),
      subtotal: data.subtotal,
      discount: data.discountValue > 0 ? {
        type: data.discountType,
        value: data.discountValue,
        amount: data.discountAmount
      } : undefined,
      tax: data.taxPercentage > 0 ? {
        name: data.taxName,
        percentage: data.taxPercentage,
        amount: data.taxAmount
      } : undefined,
      shipping: data.shipping || 0,
      total: data.total,
      currency: data.currency,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      status: data.status,
      terms: data.terms.map((term: any) => ({
        title: term.title,
        content: term.content
      })),
      notes: [{
        content: data.notes,
        createdBy: userId,
        timestamp: new Date()
      }],
      template: data.template,
      approvalHistory: [{
        status: 'pending',
        updatedBy: userId,
        timestamp: new Date()
      }]
    });

    // Save quotation to database
    await quotation.save();

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 500 }
    );
  }
}

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

    // Get search params
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "0");
    
    // Build query
    const query: any = {
      organization: user.organization
    };
    
    // Add status filter if provided
    if (status) {
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
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}