import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import Organization from "@/models/organizationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }

    const organization = await Organization.findById(user.organization);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Return quotation settings with defaults
    const quotationSettings = {
      // Existing settings
      logo: organization.logo || null,
      additionalLogos: organization.additionalLogos || [],
      defaultCurrency: organization.settings?.quotations?.defaultCurrency || 'USD',
      defaultQuotationExpiry: organization.settings?.quotations?.defaultExpiry || 30,
      termsAndConditions: organization.settings?.quotations?.termsAndConditions || '',
      emailSignature: organization.settings?.quotations?.emailSignature || '',
      
      // New quotation-specific settings
      quotationPrefix: organization.settings?.quotations?.quotationPrefix || 'QUO',
      clientSalutation: organization.settings?.quotations?.clientSalutation || 'Dear',
      companyDetails: {
        name: organization.settings?.quotations?.companyDetails?.name || organization.companyName || '',
        address: organization.settings?.quotations?.companyDetails?.address || organization.address || '',
        phone: organization.settings?.quotations?.companyDetails?.phone || organization.phone || '',
        email: organization.settings?.quotations?.companyDetails?.email || organization.email || '',
        website: organization.settings?.quotations?.companyDetails?.website || '',
        taxId: organization.settings?.quotations?.companyDetails?.taxId || '',
        registrationNumber: organization.settings?.quotations?.companyDetails?.registrationNumber || '',
      },
      defaultTermsAndConditions: organization.settings?.quotations?.termsAndConditions || '',
      digitalSignature: organization.settings?.quotations?.digitalSignature || null,
    };

    return NextResponse.json(quotationSettings);
  } catch (error) {
    console.error("Error fetching quotation settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotation settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }

    const data = await req.json();

    const organization = await Organization.findById(user.organization);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Ensure settings structure exists
    if (!organization.settings) {
      organization.settings = {};
    }
    if (!organization.settings.quotations) {
      organization.settings.quotations = {};
    }
    
    // Update quotation settings
    organization.settings.quotations = {
      ...organization.settings.quotations,
      enabled: organization.settings.quotations.enabled !== undefined ? organization.settings.quotations.enabled : true,
      defaultCurrency: data.defaultCurrency || 'USD',
      defaultExpiry: data.defaultExpiry || data.defaultQuotationExpiry || 30,
      quotationPrefix: data.quotationPrefix || 'QUO',
      clientSalutation: data.clientSalutation || 'Dear',
      companyDetails: {
        name: data.companyDetails?.name || '',
        address: data.companyDetails?.address || '',
        phone: data.companyDetails?.phone || '',
        email: data.companyDetails?.email || '',
        website: data.companyDetails?.website || '',
        taxId: data.companyDetails?.taxId || '',
        registrationNumber: data.companyDetails?.registrationNumber || '',
      },
      termsAndConditions: data.termsAndConditions || data.defaultTermsAndConditions || '',
      emailSignature: data.emailSignature || '',
      digitalSignature: data.digitalSignature !== undefined ? data.digitalSignature : organization.settings.quotations.digitalSignature || null,
    };

    // Update main organization fields if provided
    if (data.logo !== undefined) {
      organization.logo = data.logo;
    }
    if (data.additionalLogos !== undefined) {
      organization.additionalLogos = data.additionalLogos;
    }

    // Mark the settings field as modified for Mongoose
    organization.markModified('settings');
    await organization.save();

    return NextResponse.json({ 
      success: true, 
      settings: organization.settings.quotations 
    });
  } catch (error) {
    console.error("Error updating quotation settings:", error);
    return NextResponse.json(
      { error: "Failed to update quotation settings" },
      { status: 500 }
    );
  }
}