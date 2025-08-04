import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';


// GET handler to fetch organization settings
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
    
    // 3. Fetch organization data
    const organization = await Organization.findById(user.organization).select(
      'logo additionalLogos settings.quotations'
    );
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Return organization settings
    return NextResponse.json({
      logo: organization.logo || null,
      additionalLogos: organization.additionalLogos || [],
      defaultCurrency: organization.settings?.quotations?.defaultCurrency || 'USD',
      defaultQuotationExpiry: organization.settings?.quotations?.defaultExpiry || 30,
      termsAndConditions: organization.settings?.quotations?.termsAndConditions || '',
      emailSignature: organization.settings?.quotations?.emailSignature || '',
    });
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PATCH handler to update organization settings
export async function PATCH(req: NextRequest) {
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
    
    const data = await req.json();
    const organizationId = user.organization;
    
    const updateData: any = {};
    
    // Handle logo update
    if (data.logo !== undefined) {
      updateData.logo = data.logo;
    }
    
    // Handle additional logos update
    if (data.additionalLogos !== undefined) {
      updateData.additionalLogos = data.additionalLogos;
    }
    
    // Update quotation settings
    if (data.defaultCurrency !== undefined) {
      updateData['settings.quotations.defaultCurrency'] = data.defaultCurrency;
    }
    
    if (data.defaultQuotationExpiry !== undefined) {
      updateData['settings.quotations.defaultExpiry'] = data.defaultQuotationExpiry;
    }
    
    if (data.termsAndConditions !== undefined) {
      updateData['settings.quotations.termsAndConditions'] = data.termsAndConditions;
    }
    
    if (data.emailSignature !== undefined) {
      updateData['settings.quotations.emailSignature'] = data.emailSignature;
    }
    
    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: updateData },
      { new: true }
    );
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}