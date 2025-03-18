// app/api/channels/templates/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import EmailTemplate from "@/models/EmailTemplate";


// Let's do a single route file approach with a named GET handler:
export async function GET(request: Request) {
  try {
    await connectDB();

    // 1) Extract user from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Validate user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3) Fetch templates
    const templates = await EmailTemplate.find({ userId }).exec();
    return NextResponse.json(templates, { status: 200 });
  } catch (error) {
    console.error("Error getting templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}


// POST: Create a new template
export async function POST(request: Request) {
  try {
    await connectDB();

    const { name, subject, body } = await request.json();

    // 1) user from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) validate user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3) create template
    const newTemplate = new EmailTemplate({
      userId: user._id,
      name,
      subject,
      body,
    });
    const saved = await newTemplate.save();

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// PUT: Update existing template
export async function PUT(request: Request) {
  try {
    await connectDB();

    const { templateId, name, subject, body } = await request.json();

    // 1) user from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) validate user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3) find template
    const template = await EmailTemplate.findOne({ _id: templateId, userId: user._id });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 4) update
    template.name = name;
    template.subject = subject;
    template.body = body;
    const updated = await template.save();

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// DELETE: Remove template
export async function DELETE(request: Request) {
  try {
    await connectDB();

    // 1) user from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // parse the query param
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("templateId");
    if (!templateId) {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 });
    }

    // 2) ensure template is owned by user
    const template = await EmailTemplate.findOne({ _id: templateId, userId: userId });
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await EmailTemplate.findByIdAndDelete(templateId);

    return NextResponse.json({ message: "Template deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
