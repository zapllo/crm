import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import Organization from "@/models/organizationModel";
import connectDB from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organization) {
      return NextResponse.json({ error: "User organization not found" }, { status: 400 });
    }

    const organization = await Organization.findById(user.organization);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const storedTemplates = organization.whatsappIntegration?.templates || [];

    // Transform for frontend
    const frontendTemplates = storedTemplates.map(template => {
      // Extract body text from components
      let body = '';
      if (template.components && Array.isArray(template.components)) {
        const bodyComponent = template.components.find(c => c.type === 'BODY');
        if (bodyComponent && bodyComponent.text) {
          body = bodyComponent.text;
        }
      }

      return {
        id: template.whatsappTemplateId,
        _id: template.whatsappTemplateId,
        name: template.name,
        body: body || `Template: ${template.name}`,
        status: template.status,
        category: template.category,
        language: template.language,
        qualityScore: template.qualityScore,
        rejectionReason: template.rejectionReason,
        createdAt: template.syncedAt,
        type: 'whatsapp'
      };
    });

    return NextResponse.json({ 
      success: true, 
      templates: frontendTemplates,
      message: `Retrieved ${frontendTemplates.length} stored WhatsApp templates`,
      syncDetails: {
        totalTemplates: frontendTemplates.length,
        lastSyncAt: organization.whatsappIntegration?.lastSyncAt?.toISOString() || null
      }
    });

  } catch (error) {
    console.error("Error fetching stored WhatsApp templates:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch WhatsApp templates",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}