import { NextRequest, NextResponse } from "next/server";
import QuotationTemplateModel from "@/models/quotationTemplateModel";
import { User } from "@/models/userModel";
import connectDB from "@/lib/db";
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

    // Get all templates for the organization
    const templates = await QuotationTemplateModel.find({
      organization: user.organization,
    }).sort({ isDefault: -1, name: 1 });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

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
    
    // Create new template
    const template = new QuotationTemplateModel({
      name: data.name,
      description: data.description,
      organization: user.organization,
      creator: userId,
      isDefault: data.isDefault || false,
      previewImage: data.previewImage,
      layout: data.layout || {
        header: {
          show: true,
          height: 100,
          content: '',
        },
        footer: {
          show: true,
          height: 80,
          content: '',
        },
        sections: []
      },
      styles: data.styles || {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        borderStyle: 'solid',
        tableBorders: true,
        alternateRowColors: true,
        customCSS: '',
      },
      pageSettings: data.pageSettings || {
        pageSize: 'A4',
        orientation: 'portrait',
        margins: {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40,
        },
      },
    });

    // Save template to database
    await template.save();

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}