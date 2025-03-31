import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';

export async function POST(req: NextRequest) {
  try {
    console.log("TwiML endpoint received request");
    
    await connectDB();
    
    // Get form data
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    
    // Get URL parameters
    const url = new URL(req.url);
    const callId = url.searchParams.get('callId');
    const to = url.searchParams.get('To');
    
    console.log("Request parameters:", { callSid, callId, to });
    
    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Look up call record
    const call = callId ? await Call.findById(callId) : null;
    
    // Check if this is a new call or a call in progress
    if (call && callSid) {
      // If the call is already in progress with a different CallSid, just return a simple response
      if (call.status === 'in-progress' && call.twilioCallSid && call.twilioCallSid !== callSid) {
        console.log("Call already in progress with different CallSid, not creating a new dial");
        twiml.say("Call is already in progress");
        return new NextResponse(twiml.toString(), {
          headers: { 'Content-Type': 'text/xml' },
        });
      }
      
      // Update the call with the Twilio CallSid if it's not set yet
      if (!call.twilioCallSid || call.twilioCallSid === 'pending') {
        call.twilioCallSid = callSid;
        await call.save();
      }
      
      // Update call status
      if (call.status !== 'in-progress') {
        call.status = 'in-progress';
        await call.save();
        console.log("Updated call status to in-progress");
      }
    }
    
    // For new calls or the first request for a call, provide dial instructions
    if (to) {
      console.log("Providing dial instructions to:", to);
      twiml.say({ voice: 'alice' }, 'Connecting your call now.');
      
      const dial = twiml.dial({
        callerId: process.env.TWILIO_PHONE_NUMBER,
        record: 'record-from-answer',
        recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${callId || 'unknown'}`,
        recordingStatusCallbackMethod: 'POST',
        recordingStatusCallbackEvent: ['completed'],
        timeout: 30
      });
      
      dial.number(to);
    } else {
      // No destination found
      twiml.say("We couldn't determine the destination for this call. Please try again.");
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