import { NextRequest, NextResponse } from 'next/server';

import Organization from '@/models/organizationModel';
import FormModel from '@/models/formBuilderModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import connectDB from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = getDataFromToken(req);
    const user = await User.findById(userId).select('organization');
    if (!user) {
      return NextResponse.json({  message: "User not found" }, { status: 404 });
    }
    // Get organization for the current user
    const organization = await Organization.findById(user.organization);

    if (!organization) {
      return NextResponse.json({ hasAccess: false, message: "Organization not found" }, { status: 404 });
    }

    // Check if form builder is enabled for the organization
    if (!organization.formBuilder?.enabled &&
      !organization.activeSubscriptions?.includes('formBuilder')) {
      return NextResponse.json({
        hasAccess: false,
        message: "Form Builder not enabled for your organization",
        needsPurchase: true
      });
    }

    // Check limits
    const publishedFormsCount = await FormModel.countDocuments({
      organization: organization._id,
      isPublished: true
    });

    // Current month submission count
    const { currentMonth, lastResetDate } = organization.formBuilder?.submissionsCount || {
      currentMonth: 0,
      lastResetDate: new Date()
    };

    // If more than a month has passed since last reset, we should reset the counter
    const shouldResetCounter = new Date().getTime() - new Date(lastResetDate).getTime() > 30 * 24 * 60 * 60 * 1000;

    const limits = {
      maxForms: organization.formBuilder?.maxForms || 0,
      maxSubmissionsPerMonth: organization.formBuilder?.maxSubmissionsPerMonth || 0,
      currentForms: publishedFormsCount,
      currentMonthSubmissions: shouldResetCounter ? 0 : currentMonth,
      plan: organization.formBuilder?.plan || null,
      formLimitReached: publishedFormsCount >= (organization.formBuilder?.maxForms || 0),
      submissionLimitReached: currentMonth >= (organization.formBuilder?.maxSubmissionsPerMonth || 0) && !shouldResetCounter
    };

    // If counter needs reset, update the organization
    if (shouldResetCounter) {
      await Organization.findByIdAndUpdate(organization._id, {
        'formBuilder.submissionsCount.currentMonth': 0,
        'formBuilder.submissionsCount.lastResetDate': new Date()
      });
    }

    return NextResponse.json({
      hasAccess: true,
      limits
    });
  } catch (error) {
    console.error("Error checking form builder access:", error);
    return NextResponse.json(
      { hasAccess: false, message: "Failed to check access" },
      { status: 500 }
    );
  }
}
