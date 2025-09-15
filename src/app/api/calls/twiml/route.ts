import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';

// TwiML for bridging the "client" (browser) to the phone number
export async function POST(req: NextRequest) {
  try {
    console.log("TwiML endpoint received request");

    // Read form data from Twilio
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    const toNumber = formData.get('To') as string;   // We pass "To" from device.connect({ params: { To, callId }})
    const callIdParam = formData.get('callId') as string; // Also from device.connect
    console.log("Form Data => CallSid:", callSid, "To:", toNumber, "callId:", callIdParam);

    const twiml = new twilio.twiml.VoiceResponse();

    // Connect to DB and find the call record by callId or callSid
    await connectDB();
    let call = null;

    if (callIdParam) {
      call = await Call.findById(callIdParam);
      if (call) console.log("Found call by ID:", callIdParam);
    }
    if (!call && callSid) {
      call = await Call.findOne({ twilioCallSid: callSid });
      if (call) console.log("Found call by Twilio CallSid:", callSid);
    }

    if (!call) {
      console.log("Call record not found. Hanging up.");
      twiml.say("No call record found.");
      twiml.hangup();
      return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' }});
    }

    // If the callSid in DB is still 'pending', update it
    if (callSid && (!call.twilioCallSid || call.twilioCallSid === 'pending')) {
      call.twilioCallSid = callSid;
      await call.save();
    }

    // If we don't have a 'toNumber' from the Twilio request, error out
    if (!toNumber) {
      twiml.say("No destination number provided.");
      twiml.hangup();
      return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' }});
    }

    // This <Dial> will create the second leg out to the phone number
    // bridging them with the inbound client call automatically
   const dial = twiml.dial({
      // The CallerID can be your Twilio number
      callerId: process.env.TWILIO_PHONE_NUMBER,
      record: 'record-from-answer', // Enable recording
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${call._id}`,
      recordingStatusCallbackMethod: 'POST',
      timeLimit: 3600,  // max 1 hour
      // after the dial finishes, Twilio will do an HTTP request to your statusCallback
      action: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${call._id}`,
    });
    
    dial.number(
      {
        // optional: you can track events for the <Number> as well
        statusCallbackEvent: ['initiated','ringing','answered','completed'],
        statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${call._id}`,
        statusCallbackMethod: 'POST',
      },
      toNumber
    );

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (err) {
    console.error("Error in TwiML endpoint:", err);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("An error occurred.");
    twiml.hangup();
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
