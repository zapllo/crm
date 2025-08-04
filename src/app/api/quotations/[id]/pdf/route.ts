import { NextRequest, NextResponse } from "next/server";
import * as puppeteer from "puppeteer";
import QuotationModel from "@/models/quotationModel";
import QuotationTemplateModel from "@/models/quotationTemplateModel";
import { User } from "@/models/userModel";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { renderQuotationHTML } from "@/lib/quotationRenderer";

export async function GET(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
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
      return NextResponse.json({ error: "Missing organization" }, { status: 400 });
    }

    // Find quotation by ID
    const quotation = await QuotationModel.findOne({
      _id: id,
      organization: user.organization,
    })
      .populate("lead", "title leadId")
      .populate("contact", "firstName lastName email whatsappNumber")
      .populate("creator", "firstName lastName email")
.populate({
  path: "organization",
  select: "companyName logo additionalLogos email phone address tagline"
});

    if (!quotation) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    // Convert to plain JavaScript object
    const quotationObj = quotation.toObject();

    // Explicitly ensure logos object exists and has organization logo
    if (!quotationObj.logos) {
      quotationObj.logos = {};
    }

    // Explicitly copy the organization logo to logos.company if available
if (quotationObj.organization && 
    typeof quotationObj.organization === 'object' && 
    'logo' in quotationObj.organization && 
    !quotationObj.logos.company) {
quotationObj.logos.company = quotationObj.organization.logo as string;
      console.log('Explicitly set company logo from organization:', quotationObj.logos.company);
    }

    // Get template
    const template = quotation.template && typeof quotation.template === 'string' &&
      quotation.template !== 'default' ?
      await QuotationTemplateModel.findOne({
        _id: quotation.template,
        organization: user.organization,
      }) : null;

    let defaultTemplate;
    if (!template) {
      // Fallback to default template
      defaultTemplate = await QuotationTemplateModel.findOne({
        organization: user.organization,
        isDefault: true,
      });

      if (!defaultTemplate) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
    }
    // Use the same rendering function as the API
    const activeTemplate = template || defaultTemplate;
    const html = renderQuotationHTML(quotationObj, activeTemplate);

    // Launch puppeteer to create PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set content and wait for any resources to load
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF with appropriate page settings
    const pdfBuffer = await page.pdf({
      format: (activeTemplate?.pageSettings?.pageSize || 'A4') as puppeteer.PaperFormat,
      landscape: template?.pageSettings?.orientation === 'landscape',
      margin: {
        top: `${activeTemplate?.pageSettings?.margins?.top || 40}px`,
        right: `${activeTemplate?.pageSettings?.margins?.right || 40}px`,
        bottom: `${activeTemplate?.pageSettings?.margins?.bottom || 40}px`,
        left: `${activeTemplate?.pageSettings?.margins?.left || 40}px`,
      },
      printBackground: true,
    });

    await browser.close();

    // Set filename for download
    const filename = `${quotation.quotationNumber.replace(/\s/g, '_')}.pdf`;

    // Create and return response with PDF content
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}