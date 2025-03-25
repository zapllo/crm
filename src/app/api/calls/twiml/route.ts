import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Get parameters from the Twilio request
    const to = formData.get('To') as string;
    const callId = formData.get('callId') as string;
    
    if (!to || !callId) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }
    
    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Set up a dial command to the destination number
    const dial = twiml.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
      record: 'record-from-answer',
      recordingStatusCallback: `/api/calls/webhook?callId=${callId}`,
      recordingStatusCallbackEvent: ['completed'],
      // Add more parameters as needed
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