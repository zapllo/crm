import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import QuotationTemplateModel from "@/models/quotationTemplateModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { seedTemplates } from "@/lib/seedTemplates";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Get userId from token
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user from DB
    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }

    // Check if user is admin (optional security check)
    if (!user.isOrgAdmin) {
      return NextResponse.json({ error: "Only organization admins can seed templates" }, { status: 403 });
    }

    const organizationId = user.organization.toString();

    // Check if templates already exist
    const existingTemplates = await QuotationTemplateModel.find({ organization: organizationId });
    
    const body = await req.json();
    const { force = false } = body;

    if (existingTemplates.length > 0 && !force) {
      return NextResponse.json({ 
        message: `Organization already has ${existingTemplates.length} templates`,
        existingTemplates: existingTemplates.map(t => ({ id: t._id, name: t.name })),
        suggestion: "Use force=true to replace existing templates"
      }, { status: 200 });
    }

    // If force=true, delete existing templates first
    if (force && existingTemplates.length > 0) {
      await QuotationTemplateModel.deleteMany({ organization: organizationId });
      console.log(`Deleted ${existingTemplates.length} existing templates`);
    }

    // Seed new templates
    await seedTemplates(organizationId, userId);

    // Get the newly created templates
    const newTemplates = await QuotationTemplateModel.find({ organization: organizationId });

    return NextResponse.json({
      message: `Successfully seeded ${newTemplates.length} templates`,
      templates: newTemplates.map(t => ({ id: t._id, name: t.name, isDefault: t.isDefault }))
    }, { status: 200 });

  } catch (error) {
    console.error("Error seeding templates:", error);
    return NextResponse.json(
      { error: "Failed to seed templates", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}