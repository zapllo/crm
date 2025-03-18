// /app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { User } from '@/models/userModel';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';

export async function GET(request: Request) {
  try {
    await connectDB();

    // Get userId from the 'token' cookie
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Lookup user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user info as needed
    return NextResponse.json(
      {
        userId: user._id,
        email: user.email,
        isOrgAdmin: user.isOrgAdmin,
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization
        // etc.
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
