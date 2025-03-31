import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import connectDB from '@/lib/db';
import Call from '@/models/callModel';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    console.log("TwiML endpoint received request");
    
    // Extract callId from URL
    const url = new URL(req.url);
    const callId = url.searchParams.get('callId');
    
    console.log("Call ID from URL:", callId);
    
    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();
    
    if (!callId) {
      // Without a callId, we cannot proceed
      console.log("No callId provided in request");
      twiml.say("No call ID was provided. Cannot establish connection.");
      twiml.hangup();
      
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // Connect to database and get the call record
    await connectDB();
    
    // CRITICAL: Get the Twilio CallSid from the request to track which Twilio call this is
    let twilioCallSid = null;
    try {
      const formData = await req.clone().formData();
      twilioCallSid = formData.get('CallSid') as string;
      console.log("Twilio CallSid from request:", twilioCallSid);
    } catch (e) {
      console.log("Could not extract CallSid from form data");
    }
    
    const call = await Call.findById(callId);
    
    if (!call) {
      console.log("Call record not found for ID:", callId);
      twiml.say("Call record not found. Cannot establish connection.");
      twiml.hangup();
      
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // CRITICAL: Check if this is a new Twilio call but for the same call record
    // This prevents duplicate dialing which causes the busy signal
    if (twilioCallSid && call.twilioCallSid && twilioCallSid !== call.twilioCallSid) {
      console.log("This is a duplicate Twilio call for the same call record. Not initiating a new connection.");
      console.log(`Existing CallSid: ${call.twilioCallSid}, New CallSid: ${twilioCallSid}`);
      
      // Just return a simple response without dialing
      twiml.say("Call is already being processed.");
      
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // CRITICAL: Check if the call is already in progress
    if (call.status === 'in-progress') {
      console.log("Call is already in progress. Not initiating a new connection.");
      twiml.say("Your call is in progress.");
      
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // Update the call with the Twilio CallSid if we have one
    if (twilioCallSid && (!call.twilioCallSid || call.twilioCallSid === 'pending')) {
      call.twilioCallSid = twilioCallSid;
      await call.save();
      console.log("Updated call with Twilio CallSid:", twilioCallSid);
    }
    
    // Get destination number from call record or contact
    let destinationNumber = null;
    
    // First check if phone number is directly in call record
    if (call.phoneNumber) {
      destinationNumber = call.phoneNumber;
      console.log("Using phone number from call record:", destinationNumber);
    } 
    // Otherwise try to get it from the contact
    else if (call.contactId) {
      try {
        const Contact = mongoose.model('Contact');
        const contact = await Contact.findById(call.contactId);
        
        if (contact) {
          // Try all possible phone fields
          if (contact.phoneNumber) destinationNumber = contact.phoneNumber;
          else if (contact.phone) destinationNumber = contact.phone;
          else if (contact.mobile) destinationNumber = contact.mobile;
          else if (contact.whatsappNumber) destinationNumber = contact.whatsappNumber;
          
          // Format the number with country code if needed
          if (destinationNumber && !destinationNumber.startsWith('+')) {
            destinationNumber = '+91' + destinationNumber;
          }
          
          console.log("Using phone number from contact:", destinationNumber);
          
          // Store the phone number on the call record for future reference
          call.phoneNumber = destinationNumber;
          await call.save();
        }
      } catch (e) {
        console.error("Error retrieving contact:", e);
      }
    }
    
    if (!destinationNumber) {
      console.log("No destination number found for call ID:", callId);
      twiml.say("No phone number found for this call. Cannot establish connection.");
      twiml.hangup();
      
      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }
    
    // Update call status to in-progress
    call.status = 'in-progress';
    await call.save();
    console.log("Updated call status to in-progress");
    
    // Connect the call - keep this extremely simple
    console.log("Connecting call to:", destinationNumber);
    twiml.say({ voice: 'alice' }, 'Connecting your call now.');
    
    const dial = twiml.dial({
      callerId: process.env.TWILIO_PHONE_NUMBER,
      timeout: 20
    });
    
    dial.number(destinationNumber);
    
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