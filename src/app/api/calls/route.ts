import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';

export async function GET(req: NextRequest) {
    try {
        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 403 });
        }

        const url = new URL(req.url);
        const contactId = url.searchParams.get('contactId');
        const leadId = url.searchParams.get('leadId');
        const limit = Number(url.searchParams.get('limit') || '50');
        const includeCredits = url.searchParams.get('includeCredits') === 'true';

        await connectDB();

        const query: any = {
            organizationId: user.organization
        };

        if (contactId) query.contactId = contactId;
        if (leadId) query.leadId = leadId;

        const calls = await Call.find(query)
            .populate('contactId', 'firstName lastName email')
            .populate('leadId', 'title')
            .sort({ startTime: -1 })
            .limit(limit);

        let response: any = calls;

        // Include AI credits if requested
        if (includeCredits) {
            const organization = await Organization.findById(user.organization);
            response = {
                calls,
                aiCredits: organization?.aiCredits || 0
            };
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching calls:', error);
        return NextResponse.json(
            { error: 'Failed to fetch calls' },
            { status: 500 }
        );
    }
}