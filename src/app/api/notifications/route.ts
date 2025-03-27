import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Organization } from '@/models/organizationModel';
import { User } from '@/models/userModel';
import { getDataFromToken } from '@/lib/getDataFromToken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get user ID from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has an associated organization
    if (!user.organization) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // Find the organization and retrieve notifications
    const organization = await Organization.findById(user.organization);
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ notifications: organization.notifications || {} });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    // Get user ID from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user from the database
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has an associated organization
    if (!user.organization) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const { newLeadEmail, newLeadWhatsapp, dailyReportTime } = await request.json();

    // Find and update the organization with notification settings
    const updatedOrg = await Organization.findByIdAndUpdate(
      user.organization,
      {
        notifications: {
          newLeadEmail,
          newLeadWhatsapp,
          dailyReportTime,
        },
      },
      { new: true }
    );

    if (!updatedOrg) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      notifications: updatedOrg.notifications,
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
