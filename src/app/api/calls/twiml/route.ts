import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import mongoose from 'mongoose';

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
          
          // Log call details for debugging
          console.log("Call details:", JSON.stringify(call, null, 2));
        }
      }
      
      // If we couldn't find by CallSid, get the most recent call
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
          console.log("Recent call details:", JSON.stringify(recentCall, null, 2));
        }
      }
      
      // Now that we have a callId, let's find the destination number
      if (callId) {
        // Query create/route.ts to see what request parameters were used
        console.log("Looking up call record by ID:", callId);
        
        // First, check if the call document already has a phoneNumber field
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
            // Try to look up the contact directly
            try {
              const Contact = mongoose.model('Contact');
              const contact = await Contact.findById(call.contactId);
              
              if (contact) {
                console.log("Found contact:", JSON.stringify(contact, null, 2));
                
                if (contact.phoneNumber) {
                  to = contact.phoneNumber;
                  console.log("Found phone number from contact:", to);
                } else if (contact.phone) {
                  to = contact.phone;
                  console.log("Found phone from contact:", to);
                } else if (contact.mobile) {
                  to = contact.mobile;
                  console.log("Found mobile from contact:", to);
                }
              }
            } catch (e) {
              console.error("Error looking up contact:", e);
              
              // If direct contact lookup fails, try populating
              try {
                const populatedCall = await Call.findById(callId).populate('contactId');
                console.log("Populated call:", JSON.stringify(populatedCall, null, 2));
                
                if (populatedCall?.contactId) {
                  // Try different possible field names
                  const contactObj = populatedCall.contactId;
                  if (contactObj.phoneNumber) {
                    to = contactObj.phoneNumber;
                    console.log("Found phoneNumber in populated contact:", to);
                  } else if (contactObj.phone) {
                    to = contactObj.phone;
                    console.log("Found phone in populated contact:", to);
                  } else if (contactObj.mobile) {
                    to = contactObj.mobile;
                    console.log("Found mobile in populated contact:", to);
                  }
                }
              } catch (popError) {
                console.error("Error populating contact:", popError);
              }
            }
          }
        }
      }
      
      // As a last resort, try to get the phone number from the request URL or form data
      if (!to) {
        try {
          // Check URL parameters
          const url = new URL(req.url);
          const urlTo = url.searchParams.get('To');
          if (urlTo) {
            to = urlTo;
            console.log("Found 'To' in URL parameters:", to);
          } else {
            // Try form data
            const formData = await req.formData();
            const formTo = formData.get('To') as string;
            if (formTo) {
              to = formTo;
              console.log("Found 'To' in form data:", to);
            }
          }
        } catch (e) {
          console.error("Error extracting 'To' from request:", e);
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