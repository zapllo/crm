// /app/api/team-sales/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Team } from '@/models/teamModel';
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

        // 2) Find this user in DB
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 3) Grab the organization from the user doc
        const orgId = currentUser.organization;
        if (!orgId) {
            return NextResponse.json(
                { error: 'User has no organization' },
                { status: 400 }
            );
        }


        // Find the single "Sales Team" doc for that org
        const team = await Team.findOne({ organization: orgId, name: 'Sales Team' })
            .populate('manager')
            .populate('members');
        return NextResponse.json(team, { status: 200 });
    } catch (error) {
        console.error('Error fetching Sales Team:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

/**
 * POST /api/team-sales
 *   -> If the "Sales Team" doc doesn't exist, create it
 *   -> Otherwise, do partial updates (like setting manager or adding members)
 */
export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();
        const { orgId, managerId, memberIds } = data;

        if (!orgId) {
            return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
        }

        // Find or create the single "Sales Team" doc for this org
        let salesTeam = await Team.findOne({ organization: orgId, name: 'Sales Team' });
        if (!salesTeam) {
            // Create a doc if it doesn't exist
            salesTeam = new Team({
                name: 'Sales Team',
                organization: orgId,
                manager: managerId || null,
                members: memberIds || [],
            });
        } else {
            // Update fields
            if (managerId !== undefined) {
                salesTeam.manager = managerId;
            }
            if (memberIds) {
                // e.g. replace or add unique? up to you
                // For simplicity, let's set them directly
                salesTeam.members = memberIds;
            }
        }

        await salesTeam.save();
        const updated = await salesTeam.populate(['manager', 'members']);
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error('Error updating Sales Team:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
