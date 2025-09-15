import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

export async function PUT(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 403 });
        }

        const callId = (await params).id;
        const { notes } = await req.json();

        await connectDB();

        const call = await Call.findById(callId);

        if (!call) {
            return NextResponse.json(
                { error: 'Call not found' },
                { status: 404 }
            );
        }

        // Update the call notes
        call.notes = notes;
        await call.save();

        return NextResponse.json(call);
    } catch (error) {
        console.error('Error updating call notes:', error);
        return NextResponse.json(
            { error: 'Failed to update call notes' },
            { status: 500 }
        );
    }
}
