import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import Wallet from '@/models/walletModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import mongoose from 'mongoose';
import { User } from '@/models/userModel';

export async function POST(req: NextRequest) {
    try {
        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);
        // Find the user in the database
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: "User organization not found" }, { status: 403 });
        }
        const { contactId, leadId, phoneNumber, direction } = await req.json();

        if (!contactId || !phoneNumber) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        // Check wallet balance before creating call
        const wallet = await Wallet.findOne({
            organizationId: user.organization,
        });

        if (!wallet || wallet.balance < 50) { // 50 cents minimum (₹50 paise)
            return NextResponse.json(
                { error: 'Insufficient balance to make a call' },
                { status: 403 }
            );
        }

        // Create a new call record
        const call = new Call({
            organizationId: user.organization,
            userId,
            contactId,
            leadId: leadId || null,
            twilioCallSid: 'pending', // Will be updated when Twilio initiates call
            duration: 0,
            direction,
            status: 'initiated',
            cost: 0,
            startTime: new Date(),
        });

        await call.save();

        return NextResponse.json(call);
    } catch (error) {
        console.error('Error creating call:', error);
        return NextResponse.json(
            { error: 'Failed to create call record' },
            { status: 500 }
        );
    }
}
