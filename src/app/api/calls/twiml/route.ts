import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';

export async function POST(req: NextRequest) {
  try {
    // Check for parameters in both URL and body
    const url = new URL(req.url);
    
    // Get callId and To from URL parameters
    let callId = url.searchParams.get('callId');
    let to = url.searchParams.get('To');
    
    // If not in URL, try to get from body
    if (!callId || !to) {
      const body = await req.text();
      const params = new URLSearchParams(body);
      
      callId = callId || params.get('callId');
      to = to || params.get('To');
    }

    // Log what we received
    console.log('TwiML Endpoint Hit with parameters:', { 
      callId, 
      to, 
      url: req.url,
      method: req.method 
    });

    if (!to || !callId) {
      console.error('Missing required parameters:', { to, callId });
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Update call in database with the information we have
    await connectDB();
    try {
      const call = await Call.findById(callId);
      if (call) {
        call.status = 'in-progress';
        await call.save();
        console.log(`Updated call ${callId} status to in-progress`);
      }
    } catch (dbError) {
      console.error('Database error when updating call:', dbError);
      // Continue with the call even if DB update fails
    }

    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    // Set up a dial command to the destination number
    const dial = twiml.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
      record: 'record-from-answer',
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${callId}`,
      recordingStatusCallbackMethod: 'POST',
      recordingStatusCallbackEvent: ['completed'],
    });

    // Add the destination number to the dial command
    dial.number(to);

    // Log the TwiML for debugging
    console.log('Generated TwiML:', twiml.toString());

    // Return TwiML as XML
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error generating TwiML:', error);

    // Return error TwiML
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Sorry, we could not connect your call. Please try again later.');

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}