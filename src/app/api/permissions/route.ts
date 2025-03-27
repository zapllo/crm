import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/userModel';
import { Role } from '@/models/roleModel';
import { getDataFromToken } from '@/lib/getDataFromToken'; // Assuming this is the correct import path for your token helper

export async function GET(req: NextRequest) {
    try {
        // 1. Get the user ID from the token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Connect to the database
        await connectDB();

        // 3. Find the user by their ID
        const user = await User.findById(userId).populate('role');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 4. If user has no role assigned, return empty permissions
        if (!user.role) {
            return NextResponse.json({
                pagePermissions: [],
                leadAccess: 'NONE',
                featurePermissions: [],
            });
        }

        // 5. Fetch the role details
        const role = await Role.findById(user.role);
        if (!role) {
            return NextResponse.json({
                pagePermissions: [],
                leadAccess: 'NONE',
                featurePermissions: [],
            });
        }

        // 6. Return the permissions related to the user's role
        return NextResponse.json({
            pagePermissions: role.pagePermissions || [],
            leadAccess: role.leadAccess || 'NONE',
            featurePermissions: role.featurePermissions || [],
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch permissions' },
            { status: 500 }
        );
    }
}
