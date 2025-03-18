import connectDB from '@/lib/db';
import Lead from '@/models/leadModel';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        // Fetch all leads without any filter
        const leads = await Lead.find();

        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error("Error fetching all leads:", error);
        return NextResponse.json({ error: "Failed to fetch all leads" }, { status: 500 });
    }
}
