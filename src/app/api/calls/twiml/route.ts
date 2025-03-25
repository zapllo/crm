import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';

export async function POST(req: NextRequest) {
  try {
    console.log("TwiML endpoint received request");
    
    // Find the most recent outbound call in our database
    await connectDB();
    
    let callId = null;
    let to = null;
    
    try {
      // First try to get CallSid from the request
      let callSid = null;
      try {
        const formData = await req.formData();
        callSid = formData.get('CallSid') as string;
        console.log("Found CallSid in request:", callSid);
      } catch (e) {
        console.log("Could not extract CallSid from form data");
      }
      
      // If we have a CallSid, try to find the call by it
      if (callSid) {
        const call = await Call.findOne({ twilioCallSid: callSid });
        if (call) {
          callId = call._id.toString();
          console.log("Found call by CallSid:", callId);
          
          // Get the phone number
          const populatedCall = await Call.findById(call._id).populate('contactId');
          if (populatedCall?.contactId?.phoneNumber) {
            to = populatedCall.contactId.phoneNumber;
            console.log("Found phone number from call:", to);
          }
        }
      }
      
      // If we couldn't find by CallSid, get the most recent call
      if (!callId) {
        const recentCall = await Call.findOne({
          status: { $in: ['initiated', 'in-progress'] },
          direction: 'outbound'
        })
        .sort({ startTime: -1 })
        .populate('contactId')
        .limit(1);
        
        if (recentCall) {
          callId = recentCall._id.toString();
          console.log("Using most recent outbound call:", callId);
          
          // Get phone number if available
          if (recentCall.contactId && recentCall.contactId.phoneNumber) {
            to = recentCall.contactId.phoneNumber;
            console.log("Using phone number from recent call:", to);
          }
        }
      }
    } catch (e) {
      console.error("Error finding call:", e);
    }
    
    console.log("Final parameters for TwiML:", { callId, to });
    
    // Update the call status if we found one
    if (callId) {
      try {
        const call = await Call.findById(callId);
        if (call) {
          call.status = 'in-progress';
          await call.save();
          console.log("Updated call status to in-progress");
        }
      } catch (e) {
        console.error("Error updating call status:", e);
      }
    }
    
    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    
    if (!to) {
      // We couldn't find a destination number
      twiml.say("We couldn't determine the destination for this call. Please try again.");
      twiml.hangup();
    } else {
      // Connect the call
      twiml.say({ voice: 'alice' }, 'Connecting your call now.');
      
      const dial = twiml.dial({
        callerId: process.env.TWILIO_PHONE_NUMBER,
        record: 'record-from-answer',
        recordingStatusCallback: `https://crm.zapllo.com/api/calls/webhook?callId=${callId || 'unknown'}`,
        recordingStatusCallbackMethod: 'POST',
        timeout: 30
      });
      
      dial.number(to);
    }
    
    console.log("Generated TwiML:", twiml.toString());
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error("Error in TwiML endpoint:", error);
    
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say("An error occurred while processing your call.");
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}