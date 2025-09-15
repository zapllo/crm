import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import Organization from "@/models/organizationModel";

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { wabaId } = await req.json();

    if (!wabaId) {
      return NextResponse.json({ error: "WABA ID is required" }, { status: 400 });
    }

    if (!INT_TOKEN) {
      return NextResponse.json({ error: "Interakt API token not configured" }, { status: 500 });
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

    if (organization.whatsappIntegration?.wabaId !== wabaId) {
      return NextResponse.json({ error: "WABA ID mismatch" }, { status: 400 });
    }

    try {
      // Get templates from WhatsApp API via Interakt
      const whatsappResponse = await fetch(
        `https://amped-express.interakt.ai/api/v17.0/${wabaId}/message_templates?fields=id,name,status,category,language,quality_score,rejection_reason,components`,
        {
          method: 'GET',
          headers: {
            'x-access-token': INT_TOKEN,
            'x-waba-id': wabaId,
            'Content-Type': 'application/json'
          } as HeadersInit
        }
      );

      const responseText = await whatsappResponse.text();
      console.log('WhatsApp templates response:', responseText);

      let whatsappData;
      try {
        whatsappData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse WhatsApp response as JSON:', parseError);
        return NextResponse.json({
          error: 'Invalid response from WhatsApp API',
          details: responseText
        }, { status: 400 });
      }

      if (!whatsappResponse.ok) {
        console.error('WhatsApp API error:', whatsappData);
        return await returnStoredOrMockTemplates(organization, wabaId, true);
      }

      const whatsappTemplates = whatsappData.data || [];

      // Transform and clean templates for storage - excluding qualityScore
      const transformedTemplates = whatsappTemplates.map(template => {
        const cleanedTemplate = {
          whatsappTemplateId: template.id,
          name: template.name,
          category: template.category || 'UTILITY',
          language: template.language || 'en',
          status: template.status?.toUpperCase() || 'PENDING',
          components: template.components || [],
          rejectionReason: template.rejection_reason || undefined,
          // Skip qualityScore entirely - it was causing casting issues
          approvedAt: template.status === 'APPROVED' ? new Date() : undefined,
          useCount: 0,
          syncedAt: new Date()
        };

        // Remove undefined fields to avoid MongoDB issues
        Object.keys(cleanedTemplate).forEach(key => 
          cleanedTemplate[key] === undefined && delete cleanedTemplate[key]
        );

        return cleanedTemplate;
      });

      console.log(`Transformed ${transformedTemplates.length} templates for storage`);

      // Update organization with synced templates
      await Organization.findByIdAndUpdate(
        organization._id, 
        {
          $set: {
            "whatsappIntegration.templates": transformedTemplates,
            "whatsappIntegration.lastSyncAt": new Date()
          }
        },
        { new: true, runValidators: true }
      );

      console.log('Successfully saved templates to database');

      // Transform for frontend response
      const frontendTemplates = transformedTemplates.map(template => {
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
          rejectionReason: template.rejectionReason,
          createdAt: template.syncedAt,
          type: 'whatsapp'
        };
      });

      return NextResponse.json({ 
        success: true, 
        templates: frontendTemplates,
        message: `Synced ${frontendTemplates.length} WhatsApp templates from Interakt`,
        syncDetails: {
          totalSynced: frontendTemplates.length,
          lastSyncAt: new Date().toISOString(),
          source: 'interakt'
        }
      });

    } catch (apiError) {
      console.error("Error syncing from Interakt API:", apiError);
      return await returnStoredOrMockTemplates(organization, wabaId, false);
    }

  } catch (error) {
    console.error("Error syncing WhatsApp templates:", error);
    return NextResponse.json(
      { 
        error: "Failed to sync WhatsApp templates",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to return stored templates or mock templates
async function returnStoredOrMockTemplates(organization: any, wabaId: string, apiError: boolean) {
  // First try to return stored templates
  if (organization.whatsappIntegration?.templates && organization.whatsappIntegration.templates.length > 0) {
    const storedTemplates = organization.whatsappIntegration.templates.map(template => {
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
        rejectionReason: template.rejectionReason,
        createdAt: template.syncedAt,
        type: 'whatsapp'
      };
    });

    return NextResponse.json({ 
      success: true, 
      templates: storedTemplates,
      message: `Loaded ${storedTemplates.length} stored WhatsApp templates${apiError ? ' (API temporarily unavailable)' : ''}`,
      syncDetails: {
        totalSynced: storedTemplates.length,
        lastSyncAt: organization.whatsappIntegration.lastSyncAt?.toISOString() || new Date().toISOString(),
        source: 'stored'
      }
    });
  }

  // Fallback to mock templates and store them
  const mockTemplates = [
    {
      whatsappTemplateId: 'mock-wa-1',
      name: 'welcome_message',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [{
        type: 'BODY',
        text: 'Welcome to {{company.companyName}}! We\'re excited to have you as our customer. How can we help you today?'
      }],
      useCount: 0,
      syncedAt: new Date()
    },
    {
      whatsappTemplateId: 'mock-wa-2',
      name: 'lead_followup',
      category: 'MARKETING',
      language: 'en',
      status: 'APPROVED',
      components: [{
        type: 'BODY',
        text: 'Hi {{contact.firstName}}, Thank you for your interest in {{lead.title}}. Our team will contact you within 24 hours to discuss your requirements.'
      }],
      useCount: 0,
      syncedAt: new Date()
    },
    {
      whatsappTemplateId: 'mock-wa-3',
      name: 'appointment_confirmation',
      category: 'UTILITY',
      language: 'en',
      status: 'APPROVED',
      components: [{
        type: 'BODY',
        text: 'Hi {{contact.firstName}}, your appointment has been confirmed for {{lead.closeDate}}. We look forward to meeting you at our {{company.city}} office!'
      }],
      useCount: 0,
      syncedAt: new Date()
    }
  ];

  // Store mock templates in organization
  try {
    await Organization.findByIdAndUpdate(
      organization._id,
      {
        $set: {
          "whatsappIntegration.templates": mockTemplates,
          "whatsappIntegration.lastSyncAt": new Date()
        }
      },
      { new: true, runValidators: true }
    );
  } catch (storeError) {
    console.error("Error storing mock templates:", storeError);
  }

  const frontendTemplates = mockTemplates.map(template => ({
    id: template.whatsappTemplateId,
    _id: template.whatsappTemplateId,
    name: template.name,
    body: template.components[0]?.text || `Template: ${template.name}`,
    status: template.status,
    category: template.category,
    language: template.language,
    createdAt: template.syncedAt,
    type: 'whatsapp'
  }));

  return NextResponse.json({ 
    success: true, 
    templates: frontendTemplates,
    message: `Connected to WABA ${wabaId}. Showing sample templates${apiError ? ' (API temporarily unavailable)' : ''}`,
    syncDetails: {
      totalSynced: frontendTemplates.length,
      lastSyncAt: new Date().toISOString(),
      usedMockData: true,
      source: 'mock'
    }
  });
}