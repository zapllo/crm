// /app/api/team-sales/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/userModel';
import { getDataFromToken } from '@/lib/getDataFromToken';

export async function GET(request: Request) {
    try {
        await connectDB();
        // 1) Decode token from the cookie
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid or missing token' },
                { status: 401 }
            );
        }

        // 2) Find the current user in DB
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 3) Get the organization ID from the current user
        const orgId = currentUser.organization;
        if (!orgId) {
            return NextResponse.json(
                { error: 'User has no organization' },
                { status: 400 }
            );
        }

        // 4) Fetch all users belonging to the organization
        const users = await User.find({ organization: orgId });

        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        console.error('Error fetching organization users:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
