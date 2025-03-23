import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import Lead from '@/models/leadModel';
import { User } from '@/models/userModel';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const userData = getDataFromToken(request);
        if (!userData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Find the user in the database
        const user = await User.findById(userData).select("organization");
        if (!user?.organization) {
            return NextResponse.json({ error: "User organization not found" }, { status: 403 });
        }

        const leads = await Lead.find({ organization: user.organization })
            .populate('contact')
            .sort({ createdAt: -1 });

        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error("Error fetching all leads:", error);
        return NextResponse.json({ error: "Failed to fetch all leads" }, { status: 500 });
    }
}
