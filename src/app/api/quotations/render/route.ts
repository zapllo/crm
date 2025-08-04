import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import QuotationTemplateModel from "@/models/quotationTemplateModel";
import Organization from "@/models/organizationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { renderQuotationHTML } from "@/lib/quotationRenderer";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const templateId = searchParams.get("template");
    const quotationDataStr = searchParams.get("data");

    if (!templateId || !quotationDataStr) {
      return new Response("Missing template ID or quotation data", { status: 400 });
    }

    // Parse quotation data
    let quotation;
    try {
      quotation = JSON.parse(decodeURIComponent(quotationDataStr));
    } catch (error) {
      return new Response("Invalid quotation data", { status: 400 });
    }

    // Get userId from token for authorization
    const userId = getDataFromToken(req);

    // For shared/public links, we may not have a user token
    let organizationId;
    if (userId) {
      // If we have a userId, verify user and get organization
      const user = await User.findById(userId);
      if (!user) {
        return new Response("User not found", { status: 404 });
      }
      organizationId = user.organization;
    } else if (quotation.organization) {
      // If no user token but we have organization ID in the quotation data
      organizationId = quotation.organization;
    } else {
      return new Response("Unauthorized", { status: 401 });
    }

    // IMPORTANT: Fetch the complete organization document with all needed fields
    const organization = await Organization.findById(organizationId)
      .select('_id companyName logo additionalLogos email phone address tagline');

    console.log("Organization from DB:", {
      _id: organization?._id,
      logo: organization?.logo,
      fields: organization ? Object.keys(organization.toObject()) : []
    });

    if (!organization) {
      return new Response("Organization not found", { status: 404 });
    }

    let template;

    // Check if templateId is "default" or an actual ObjectId
    if (templateId === "default") {
      // Get the default template for this organization
      template = await QuotationTemplateModel.findOne({
        organization: organizationId,
        isDefault: true,
      });
    } else {
      // Try to get the specific template by ID
      try {
        template = await QuotationTemplateModel.findOne({
          _id: templateId,
          organization: organizationId,
        });
      } catch (error) {
        // Handle invalid ObjectId format
        template = null;
      }
    }

    // If template not found, try to find the default
    if (!template) {
      template = await QuotationTemplateModel.findOne({
        organization: organizationId,
        isDefault: true,
      });

      // If still no template, return error
      if (!template) {
        return new Response("No suitable template found", { status: 404 });
      }
    }

    // Add organization logo to quotation if not present
    if (!quotation.logos) {
      quotation.logos = {
        company: organization.logo || null,
        additional: organization.additionalLogos || []
      };
    } else if (!quotation.logos.company && organization.logo) {
      quotation.logos.company = organization.logo;
    }

    // Render with the template using the shared helper function
    const html = renderQuotationHTML(quotation, template, organization);

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });

  } catch (error: any) {
    console.error("Error rendering quotation:", error);
    return new Response(`Error rendering quotation: ${error.message}`, { status: 500 });
  }
}