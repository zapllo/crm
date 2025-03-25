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
    const callId = formData.get('CallId') as string; // Custom parameter we passed
    
    // Log the webhook data for debugging
    console.log('Twilio webhook received:', {
      callSid,
      callStatus,
      recordingUrl,
      recordingSid,
      callDuration,
      callId
    });
    
    // Only process if we have a call ID
    if (callId) {
      await connectDB();
      
      // Find and update the call record
      const call = await Call.findById(callId);
      
      if (call) {
        call.twilioCallSid = callSid;
        
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
        
        // Handle recording URL if available
        if (recordingUrl) {
          call.recordingUrl = recordingUrl;
          call.twilioRecordingSid = recordingSid;
        }
        
        // Update call duration if available
        if (callDuration > 0) {
          call.duration = callDuration;
          
          // If call is completed, calculate cost and update wallet
          if (callStatus === 'completed' && !call.endTime) {
            // Set end time if not already set
            call.endTime = new Date();
            
            // Calculate call cost (₹1.5 per minute)
            const costPerMinute = 150; // 150 paise = ₹1.50
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
        
        await call.save();
      }
    }
    
    // Return a TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    
    // You can customize the response based on your needs
    if (callStatus === 'ringing' || callStatus === 'in-progress') {
      // For initial call or in-progress call
      twiml.say('Thank you for using ZaplloCRM calling. Your call is now being connected.');
      
      // Start recording if in-progress
      if (callStatus === 'in-progress') {
        twiml.record({
          action: `/api/calls/webhook?callId=${callId}`,
          transcribe: true,
          transcribeCallback: `/api/calls/transcription?callId=${callId}`,
          maxLength: 3600, // 1 hour max
          playBeep: false
        });
      }
    } else if (callStatus === 'completed') {
      // For completed calls
      twiml.say('Thank you for using ZaplloCRM calling. Your call has been completed.');
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
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

