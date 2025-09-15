import { NextResponse } from 'next/server';
import FormSubmission from '@/models/formSubmissionModel';
import Organization from '@/models/organizationModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import connectDB from '@/lib/db';
import { User } from '@/models/userModel';

export async function GET(request: Request) {
  try {
    // Get userId from the 'token' cookie
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // First, get the user
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const organization = await Organization.findById(user.organization);

    if (!organization) {
      return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    // Get overall submission stats
    const totalSubmissions = await FormSubmission.countDocuments({
      organization: organization._id
    });

    // Get today's submissions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = await FormSubmission.countDocuments({
      organization: organization._id,
      createdAt: { $gte: today }
    });

    // Get this week's submissions
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekSubmissions = await FormSubmission.countDocuments({
      organization: organization._id,
      createdAt: { $gte: weekStart }
    });

    // Get this month's submissions
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthSubmissions = await FormSubmission.countDocuments({
      organization: organization._id,
      createdAt: { $gte: monthStart }
    });

    // Get the current month's submission count from the organization document
    // This is what's being tracked for billing/limits
    const orgSubmissionCount = organization.formBuilder?.submissionsCount?.currentMonth || 0;

    // Log for debugging
    console.log('Submission stats:', {
      orgId: organization._id.toString(),
      totalSubmissions,
      monthSubmissions,
      trackedSubmissions: orgSubmissionCount,
      orgSubmissionData: organization.formBuilder?.submissionsCount || 'Not found'
    });

    return NextResponse.json({
      success: true,
      totalSubmissions,
      todaySubmissions,
      weekSubmissions,
      monthSubmissions,
      // Use the organization's tracked count for the usage stats
      currentMonthSubmissions: orgSubmissionCount,
      submissionsResetDate: organization.formBuilder?.submissionsCount?.lastResetDate || new Date(),
      maxSubmissionsPerMonth: organization.formBuilder?.maxSubmissionsPerMonth || 0
    });

  } catch (error) {
    console.error("Error fetching submission stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch submission stats", error: String(error) },
      { status: 500 }
    );
  }
}
