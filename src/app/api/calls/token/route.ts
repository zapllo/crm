import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getDataFromToken } from '@/lib/getDataFromToken';

export async function POST(req: NextRequest) {
  try {
    // Get logged-in user ID from the token
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const appSid = process.env.TWILIO_APP_SID;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !authToken || !appSid || !apiKeySid || !apiKeySecret) {
      return NextResponse.json(
        { error: 'Twilio configuration missing' },
        { status: 500 }
      );
    }

    // Create an Access Token
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: appSid,
      incomingAllow: true, // Allow incoming calls
    });

    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, { identity: userId });
    token.addGrant(voiceGrant);

    return NextResponse.json({ token: token.toJwt() }, { status: 200 });
  } catch (error) {
    console.error('Error generating Twilio token:', error);
    return NextResponse.json(
      { error: 'Failed to generate Twilio token' },
      { status: 500 }
    );
  }
}
