import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import Wallet from '@/models/walletModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import mongoose from 'mongoose';
import { User } from '@/models/userModel';
import twilio from 'twilio';

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

        // Format the phone number with correct country code
        let formattedPhoneNumber = phoneNumber;

        // If the number doesn't start with +, add +91
        if (!phoneNumber.startsWith('+')) {
            formattedPhoneNumber = '+91' + phoneNumber;
        }
        // If it starts with just +, add 91 after the +
        else if (phoneNumber.startsWith('+') && !phoneNumber.startsWith('+91')) {
            formattedPhoneNumber = '+91' + phoneNumber.substring(1);
        }

        // Initialize Twilio client
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            throw new Error('Missing Twilio credentials in environment variables');
        }
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        // Ensure we have a valid call ID
        const callId = call._id.toString();

        console.log('Initiating Twilio call with parameters:', {
            to: formattedPhoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER as string,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml?callId=${callId}&To=${encodeURIComponent(formattedPhoneNumber)}`,
        });

        // Initiate the actual call through Twilio
        const twilioCall = await client.calls.create({
            to: formattedPhoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/twiml?callId=${callId}&To=${encodeURIComponent(formattedPhoneNumber)}`,
            statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${callId}`,
            statusCallbackMethod: 'POST',
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        });

        // Update the call record with the Twilio SID
        call.twilioCallSid = twilioCall.sid;
        await call.save();

        return NextResponse.json({
            success: true,
            message: 'Call initiated successfully',
            call: call
        });
    } catch (error: any) {
        console.error('Error creating call:', error);
        return NextResponse.json(
            { error: 'Failed to create call record', details: error.message },
            { status: 500 }
        );
    }
}