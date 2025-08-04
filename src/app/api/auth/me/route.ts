// /app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectDB();

    // Get userId from the 'token' cookie
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the user
    const user = await User.findById(userId).select('-password').populate('role');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Explicitly fetch the organization using the organization ID from the user
    let organizationData = null;
    if (user.organization) {
      organizationData = await Organization.findById(user.organization)
        .select('companyName trialExpires isPro subscribedPlan subscriptionExpires activeSubscriptions credits subscribedUserCount formBuilder whatsappIntegration');
    }

    // Return user info with the organization data
    return NextResponse.json(
      {
        userId: user._id,
        email: user.email,
        isOrgAdmin: user.isOrgAdmin,
        firstName: user.firstName,
        lastName: user.lastName,
        whatsappNo: user.whatsappNo,
        profileImage: user.profileImage,
        role: user.role,
        organization: organizationData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
