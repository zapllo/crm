import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';

export async function POST(req: NextRequest) {
  try {
    console.log("TwiML endpoint received request");
    
    // Extract callId from URL
    const url = new URL(req.url);
    const callId = url.searchParams.get('callId');
    
    console.log("Call ID from URL:", callId);
    
    // Attempt to get the Twilio CallSid from form data
    let twilioCallSid = null;
    try {
      const formData = await req.clone().formData();
      twilioCallSid = formData.get('CallSid') as string;
      console.log("Twilio CallSid from request:", twilioCallSid);
    } catch (e) {
      console.log("Could not extract CallSid from form data:", e);
    }
    
    // Create a TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    // Connect to database
    await connectDB();
    
    // Look up the call record
    let call = null;
    
    if (callId) {
      call = await Call.findById(callId);
      if (call) console.log(`Found call record by ID: ${callId}`);
    }
    
    if (!call && twilioCallSid) {
      call = await Call.findOne({ twilioCallSid });
      if (call) console.log(`Found call record by Twilio CallSid: ${twilioCallSid}`);
    }
    
    if (!call) {
      console.log("Call record not found", { callId, twilioCallSid });
      twiml.say("No call record found. Please try again later.");
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // If already completed/failed, end
    if (['completed', 'failed', 'busy', 'no-answer', 'canceled'].includes(call.status)) {
      console.log(`Call is already ${call.status}.`);
      twiml.say(`This call has already been ${call.status}. Goodbye.`);
      twiml.hangup();
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Check for duplicate Twilio SID
    if (
      twilioCallSid &&
      call.twilioCallSid &&
      twilioCallSid !== call.twilioCallSid &&
      call.twilioCallSid !== 'pending'
    ) {
      console.log("Duplicate Twilio call for the same call record, ignoring.");
      twiml.say("Call is already being processed. Goodbye.");
      twiml.hangup();
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Update the call SID if needed (when it was 'pending')
    if (twilioCallSid && (!call.twilioCallSid || call.twilioCallSid === 'pending')) {
      call.twilioCallSid = twilioCallSid;
      await call.save();
      console.log(`Updated call with Twilio CallSid: ${twilioCallSid}`);
    }

    // If status is still 'initiated' or 'ringing', move it to 'in-progress'
    if (call.status === 'initiated' || call.status === 'ringing') {
      call.status = 'in-progress';
      await call.save();
      console.log("Updated call status to in-progress");
    }

    // Since we removed <Dial>, we won't create a second call leg.
    // You can optionally play a short message, or even do nothing.
    twiml.say("Thank you. Your call is being connected now.");

    // Optionally just return or hang up if you do not want any audio:
    // twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error("Error in TwiML endpoint:", error);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("An error occurred while processing your call.");
    twiml.hangup();
    
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
