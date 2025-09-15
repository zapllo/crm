import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import QuotationTemplateModel from "@/models/quotationTemplateModel";
import Organization from "@/models/organizationModel";
import Contact from "@/models/contactModel";
import Lead from "@/models/leadModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { renderQuotationHTML } from "@/lib/quotationRenderer";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const templateId = searchParams.get("template");
    const quotationDataStr = searchParams.get("data");
    if (!templateId || !quotationDataStr) {
      return new Response("Missing template ID or quotation data", { status: 400 });
    }

    // Parse quotation data (may contain ObjectIds as strings)
    let quotation: any;
    try {
      quotation = JSON.parse(decodeURIComponent(quotationDataStr));
    } catch {
      return new Response("Invalid quotation data", { status: 400 });
    }

    // Get org
    const userId = getDataFromToken(req);
    let organizationId: string | undefined;
    if (userId) {
      const user = await User.findById(userId);
      if (!user) return new Response("User not found", { status: 404 });
      organizationId = String(user.organization);
    } else if (quotation.organization) {
      organizationId = String(quotation.organization);
    } else {
      return new Response("Unauthorized", { status: 401 });
    }

    // IMPORTANT: include org signature in the projection
    const organization = await Organization.findById(organizationId)
      .select("_id companyName logo additionalLogos email phone address tagline settings")
      .lean();

    if (!organization) return new Response("Organization not found", { status: 404 });

    // ---- Populate contact (and company name) if needed ---------------------
    const looksLikeId = (v: any) =>
      typeof v === "string" && mongoose.isValidObjectId(v);

    if (quotation.contact && (looksLikeId(quotation.contact) || quotation.contact?._id)) {
      const contactId = looksLikeId(quotation.contact) ? quotation.contact : quotation.contact._id;
      const contact = await Contact.findById(contactId)
        .select("firstName lastName email whatsappNumber address city state country pincode company")
        .populate({ path: "company", select: "name" })
        .lean();
      if (contact) quotation.contact = contact;
    }

    // ---- Populate lead if needed ------------------------------------------
    if (quotation.lead && (looksLikeId(quotation.lead) || quotation.lead?._id)) {
      const leadId = looksLikeId(quotation.lead) ? quotation.lead : quotation.lead._id;
      const lead = await Lead.findById(leadId).select("title leadId description").lean();
      if (lead) quotation.lead = lead;
    }

    // ---- Ensure footer companyDetails fall back to org ---------------------
    quotation.companyDetails = {
      name: quotation?.companyDetails?.name || organization.companyName || "",
      address: quotation?.companyDetails?.address || organization.address || "",
      phone: quotation?.companyDetails?.phone || organization.phone || "",
      email: quotation?.companyDetails?.email || organization.email || "",
      website: quotation?.companyDetails?.website || "",
      taxId: quotation?.companyDetails?.taxId || "",
      registrationNumber: quotation?.companyDetails?.registrationNumber || "",
    };

    // ---- Ensure logos present ---------------------------------------------
    if (!quotation.logos) {
      quotation.logos = {
        company: organization.logo || null,
        additional: organization.additionalLogos || [],
      };
    } else if (!quotation.logos.company && organization.logo) {
      quotation.logos.company = organization.logo;
    }

    // ---- Pull a template ---------------------------------------------------
    let template: any = null;
    if (templateId === "default") {
      template = await QuotationTemplateModel.findOne({ organization: organizationId, isDefault: true }).lean();
    } else {
      template = await QuotationTemplateModel.findOne({ _id: templateId, organization: organizationId }).lean();
      if (!template) {
        template = await QuotationTemplateModel.findOne({ organization: organizationId, isDefault: true }).lean();
      }
    }
    if (!template) return new Response("No suitable template found", { status: 404 });

    // ---- Surface org signature to the renderer via organization -----------
    // renderer checks organization.settings.quotations.digitalSignature
    // (this is now included because we fetched `settings`)
    const html = renderQuotationHTML(quotation, template, organization);

    return new Response(html, { headers: { "Content-Type": "text/html" } });
  } catch (error: any) {
    console.error("Error rendering quotation:", error);
    return new Response(`Error rendering quotation: ${error.message}`, { status: 500 });
  }
}
