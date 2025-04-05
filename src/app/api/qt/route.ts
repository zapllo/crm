import { NextResponse } from 'next/server';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';
import connectDB from '@/lib/db';
import { seedTemplates } from '@/lib/seedTemplates';

export async function GET(request: Request) {
  try {
    await connectDB();

    // Extract userId from query string
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get the user by ID
    const user = await User.findById(userId).select('-password').populate('role');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get organization info
    let organizationData = null;
    if (user.organization) {
      organizationData = await Organization.findById(user.organization).select(
        'companyName trialExpires isPro subscribedPlan subscriptionExpires credits'
      );
    }

    // Run template seeding
    await seedTemplates(user.organization.toString(), userId.toString());

    // Return final response
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
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
