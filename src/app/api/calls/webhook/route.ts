import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import Wallet from '@/models/walletModel';

// This route doesn't need to be authenticated as it's called by Twilio
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract the necessary parameters from Twilio's webhook
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const callDuration = Number(formData.get('CallDuration') || '0');

    // Extract callId from URL if available
    const url = new URL(req.url);
    let callId = url.searchParams.get('callId');

    // Log the webhook data for debugging
    console.log('Twilio webhook received:', {
      callSid,
      callStatus,
      recordingUrl,
      recordingSid,
      callDuration,
      callId
    });

    // If callId is missing but we have callSid, look up the call record
    if (!callId && callSid) {
      await connectDB();
      const existingCall = await Call.findOne({ twilioCallSid: callSid });
      if (existingCall) {
        callId = existingCall._id.toString();
        console.log(`Found call record by Twilio CallSid: ${callId}`);
      } else {
        console.log(`Could not find call record for Twilio CallSid: ${callSid}`);
      }
    }

    // Process the call if we have identified it
    if (callId) {
      await connectDB();

      // Find and update the call record
      const call = await Call.findById(callId);

      if (call) {
        // Only update the call SID if it's still pending
        if (call.twilioCallSid === 'pending') {
          call.twilioCallSid = callSid;
        }

        // Map Twilio call status to our statuses
        switch (callStatus) {
          case 'in-progress':
            call.status = 'in-progress';
            break;
          case 'completed':
            call.status = 'completed';
            break;
          case 'busy':
            call.status = 'busy';
            break;
          case 'no-answer':
            call.status = 'no-answer';
            break;
          case 'canceled':
            call.status = 'canceled';
            break;
          case 'failed':
            call.status = 'failed';
            break;
          default:
            call.status = callStatus;
        }

        if (recordingUrl) {
          call.recordingUrl = recordingUrl;
          call.twilioRecordingSid = recordingSid;

          // Enable transcription for the recording
          if (recordingSid) {
            try {
              const twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
              );

              // Create transcription
              await twilioClient.recordings(recordingSid).transcriptions.create({
                transcriptionCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/transcription`,
                transcriptionCallbackMethod: 'POST'
              });

              console.log(`Transcription requested for recording: ${recordingSid}`);
            } catch (transcriptionError) {
              console.error('Failed to request transcription:', transcriptionError);
            }
          }
        }


        // Update call duration if available
        if (callDuration > 0) {
          call.duration = callDuration;

          // If call is completed, calculate cost and update wallet
          if (callStatus === 'completed' && !call.endTime) {
            // Set end time if not already set
            call.endTime = new Date();

            // Calculate call cost (₹5 per minute)
            const costPerMinute = 500; // 500 paise = ₹5.00
            const durationInMinutes = callDuration / 60;
            const callCost = Math.ceil(durationInMinutes * costPerMinute);

            call.cost = callCost;

            // Update wallet balance
            const organization = call.organizationId;
            const wallet = await Wallet.findOne({ organizationId: organization });

            if (wallet) {
              wallet.balance -= callCost;

              // Add transaction record
              wallet.transactions.push({
                type: 'debit',
                amount: callCost,
                description: `Call with duration ${callDuration} seconds`,
                reference: call._id.toString(),
                createdAt: new Date()
              });

              wallet.lastUpdated = new Date();
              await wallet.save();
            }
          }
        }
        // Replace the old transcription comment with:
        if (callStatus === 'completed' && recordingSid) {
          console.log(`Call ${callId} completed with recording ${recordingSid} - transcription requested`);
        }

        console.log(`Updating call ${callId} to status: ${call.status}`);
        await call.save();
      } else {
        console.log(`Call record not found for ID: ${callId}`);
      }
    } else {
      console.log('No call ID available, cannot update call record');
    }

    // Return a simple TwiML response - avoid complex logic here
    const twiml = new twilio.twiml.VoiceResponse();

    // For completed or failed calls, hangup to prevent repeat calls
    if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(callStatus)) {
      twiml.hangup();
    } else {
      twiml.say('Call event processed.');
    }

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);

    // Return a basic TwiML response even in case of error
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('An error occurred processing your call.');
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}
