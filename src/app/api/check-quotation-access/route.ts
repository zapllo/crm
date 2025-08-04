import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 1. Get userId from token
    const userId = getDataFromToken(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", hasAccess: false }, { status: 401 });
    }

    // 2. Fetch the user from DB
    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ error: "User not found", hasAccess: false }, { status: 404 });
    }

    if (!user.organization) {
        return NextResponse.json({ error: "Missing orgId", hasAccess: false }, { status: 400 });
    }

    // Check if user's organization has subscribed to the Quotation plan
    const organization = await Organization.findById(user.organization);

    if (!organization) {
      return NextResponse.json({ hasAccess: false }, { status: 404 });
    }

    // Check for quotation access using all possible methods
    const hasAccess =
      // Check traditional subscribedPlan field
      organization.subscribedPlan === 'Zapllo Quotations' ||
      organization.subscribedPlan === 'Zapllo CRM & Quotations' ||
      organization.subscribedPlan?.includes('Quotation') ||

      // Check new activeSubscriptions array (if exists)
      (Array.isArray(organization.activeSubscriptions) &&
       organization.activeSubscriptions.includes('quotation')) ||

      // Check settings.quotations.enabled flag (if exists)
      (organization.settings?.quotations?.enabled === true);

    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error('Error checking quotation access:', error);
    return NextResponse.json({ hasAccess: false }, { status: 500 });
  }
}
