import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    console.log("TwiML endpoint received request");
    
    // Connect to database first
    await connectDB();
    
    let callId = null;
    let to = null;
    let callSid = null;
    
    // Extract URL parameters first - this doesn't consume the request body
    const url = new URL(req.url);
    callId = url.searchParams.get('callId');
    to = url.searchParams.get('To');
    
    console.log("URL parameters:", { callId, to });
    
    // Only try to get form data if we need to
    if (!callSid || !callId) {
      try {
        // Clone the request before consuming its body
        const reqClone = req.clone();
        const formData = await reqClone.formData();
        callSid = formData.get('CallSid') as string;
        
        // If callId wasn't in URL, check form data
        if (!callId) {
          callId = formData.get('callId') as string;
        }
        
        // If to wasn't in URL, check form data
        if (!to) {
          to = formData.get('To') as string;
        }
        
        console.log("Form data:", { callSid, callId, to });
      } catch (e) {
        console.log("Could not extract data from form data:", e);
      }
    }
    
    // If we have a CallSid, try to find the call by it
    if (callSid && !callId) {
      const call = await Call.findOne({ twilioCallSid: callSid });
      if (call) {
        callId = call._id.toString();
        console.log("Found call by CallSid:", callId);
      }
    }
    
    // If we don't have a callId yet, get the most recent call
    if (!callId) {
      const recentCall = await Call.findOne({
        status: { $in: ['initiated', 'in-progress'] },
        direction: 'outbound'
      })
      .sort({ startTime: -1 })
      .limit(1);
      
      if (recentCall) {
        callId = recentCall._id.toString();
        console.log("Using most recent outbound call:", callId);
      }
    }
    
    // Now that we have a callId, let's find the destination number if we don't have it
    if (callId && !to) {
      console.log("Looking up call record by ID:", callId);
      
      const call = await Call.findById(callId);
      if (call) {
        console.log("Retrieved call for contact lookup:", JSON.stringify(call));
        
        // Check if this call has a direct phoneNumber field
        if (call.phoneNumber) {
          to = call.phoneNumber;
          console.log("Found phone number directly on call record:", to);
        }
        
        // If not, check if it has a contactId and get the phone from there
        if (!to && call.contactId) {
          try {
            const Contact = mongoose.model('Contact');
            const contact = await Contact.findById(call.contactId);
            
            if (contact) {
              console.log("Found contact:", JSON.stringify(contact, null, 2));
              
              // Try all possible phone field names
              if (contact.phoneNumber) {
                to = contact.phoneNumber;
              } else if (contact.phone) {
                to = contact.phone;
              } else if (contact.mobile) {
                to = contact.mobile;
              } else if (contact.whatsappNumber) { // Add this for whatsapp number
                to = contact.whatsappNumber;
              }
              
              // Format the number if found
              if (to) {
                // Make sure it has country code
                if (!to.startsWith('+')) {
                  to = '+91' + to; // Add India code by default
                }
                console.log("Found phone number from contact:", to);
              }
            }
          } catch (e) {
            console.error("Error looking up contact:", e);
          }
        }
      }
    }
    
    console.log("Final parameters for TwiML:", { callId, to });
    
    // Update the call status if we found one
    if (callId) {
      try {
        const call = await Call.findById(callId);
        if (call) {
          call.status = 'in-progress';
          // If we found a phone number and it's not stored on the call, store it
          if (to && !call.phoneNumber) {
            call.phoneNumber = to;
          }
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
        recordingStatusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${callId || 'unknown'}`,
        recordingStatusCallbackMethod: 'POST',
        recordingStatusCallbackEvent: ['completed'],
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