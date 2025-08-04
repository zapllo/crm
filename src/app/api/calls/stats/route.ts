import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

export async function GET(req: NextRequest) {
    try {
        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 403 });
        }

        await connectDB();

        // Get total calls count
        const totalCalls = await Call.countDocuments({
            organizationId: user.organization,
        });

        // Get sum of all call durations
        const durationResult = await Call.aggregate([
            {
                $match: {
                    organizationId: user.organization,
                    status: 'completed',
                },
            },
            {
                $group: {
                    _id: null,
                    totalDuration: { $sum: '$duration' },
                },
            },
        ]);

        const totalDuration = durationResult.length > 0 ? durationResult[0].totalDuration : 0;

        // Get calls made this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const callsThisMonth = await Call.countDocuments({
            organizationId: user.organization,
            startTime: { $gte: startOfMonth },
        });

        return NextResponse.json({
            totalCalls,
            totalDuration,
            callsThisMonth,
        });
    } catch (error) {
        console.error('Error fetching call stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch call statistics' },
            { status: 500 }
        );
    }
}
