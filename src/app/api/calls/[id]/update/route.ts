import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import Wallet from '@/models/walletModel';

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
    const { duration, status, twilioCallSid, recordingUrl, transcription } = await req.json();

    await connectDB();

    const call = await Call.findById(callId);

    if (!call) {
      return NextResponse.json(
        { error: 'Call not found' },
        { status: 404 }
      );
    }

    // Only update specified fields
    if (duration !== undefined) call.duration = duration;
    if (status !== undefined) call.status = status;
    if (twilioCallSid !== undefined) call.twilioCallSid = twilioCallSid;
    if (recordingUrl !== undefined) call.recordingUrl = recordingUrl;
    if (transcription !== undefined) call.transcription = transcription;

    // Calculate cost based on duration (₹1.5 per minute)
    if (duration && status === 'completed') {
      const costPerMinute = 150; // 150 paise = ₹1.50
      const durationInMinutes = duration / 60;
      const callCost = Math.ceil(durationInMinutes * costPerMinute);

      call.cost = callCost;
      call.endTime = new Date();

      // Deduct cost from wallet
      const wallet = await Wallet.findOne({
        organizationId: user.organization
      });

      if (wallet) {
        wallet.balance -= callCost;

        // Add transaction record
        wallet.transactions.push({
          type: 'debit',
          amount: callCost,
          description: `Call to ${call.contactId.firstName} ${call.contactId.lastName}`,
          reference: call._id.toString(),
          createdAt: new Date()
        });

        wallet.lastUpdated = new Date();
        await wallet.save();
      }
    }

    await call.save();

    return NextResponse.json(call);
  } catch (error) {
    console.error('Error updating call:', error);
    return NextResponse.json(
      { error: 'Failed to update call record' },
      { status: 500 }
    );
  }
}
