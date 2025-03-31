import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';

export async function POST(req: NextRequest) {
  try {
    console.log("TwiML endpoint received request");
    
    // Get URL parameters (the only method we'll use)
    const url = new URL(req.url);
    const to = url.searchParams.get('To');
    
    console.log("Call destination:", to);
    
    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    
    if (to) {
      console.log("Connecting call to:", to);
      
      // Simple approach: just say we're connecting and dial the number
      twiml.say({ voice: 'alice' }, 'Connecting your call.');
      
      const dial = twiml.dial({
        callerId: process.env.TWILIO_PHONE_NUMBER,
        timeout: 30
      });
      
      dial.number(to);
    } else {
      twiml.say("No destination number provided.");
      twiml.hangup();
    }
    
    console.log("Generated TwiML:", twiml.toString());
    
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error("Error in TwiML endpoint:", error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("An error occurred while processing your call.");
    
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}