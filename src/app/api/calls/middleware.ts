import { NextResponse } from 'next/server';
import twilio from 'twilio';
import Call from '@/models/callModel';

/**
 * Creates a standardized TwiML response
 */
export function createTwimlResponse(message: string, hangup: boolean = false): NextResponse {
  const twiml = new twilio.twiml.VoiceResponse();
  
  if (message) {
    twiml.say({ voice: 'alice' }, message);
  }
  
  if (hangup) {
    twiml.hangup();
  }
  
  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}

/**
 * Logs call events in a standardized format
 */
export function logCallEvent(callId: string | null, eventType: string, details: any): void {
  console.log(`CALL EVENT [${new Date().toISOString()}] ${eventType} | CallID: ${callId || 'UNKNOWN'} | ${JSON.stringify(details)}`);
}

/**
 * Finds a call by ID or Twilio SID
 */
export async function findCallRecord(callId: string | null, twilioCallSid: string | null): Promise<any> {
  if (!callId && !twilioCallSid) return null;
  
  if (callId) {
    try {
      return await Call.findById(callId);
    } catch (e) {
      console.error(`Error finding call by ID ${callId}:`, e);
    }
  }
  
  if (twilioCallSid) {
    try {
      return await Call.findOne({ twilioCallSid });
    } catch (e) {
      console.error(`Error finding call by Twilio SID ${twilioCallSid}:`, e);
    }
  }
  
  return null;
}