import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import connectDB from "@/lib/db";
import Call from "@/models/callModel";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Parse the request from Twilio
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;

    // Get any speech results if they exist
    const speechResult = formData.get('SpeechResult') as string;

    // Extract callId from URL
    const url = new URL(req.url);
    const callId = url.searchParams.get('callId');

    console.log(`AI Conversation webhook called - CallSid: ${callSid}, Status: ${callStatus}, CallId: ${callId}`);
    console.log(`Speech result: ${speechResult || 'None'}`);

    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    // If the call is just starting
    if (callStatus === 'in-progress' && !speechResult) {
      await connectDB();
      const call = await Call.findById(callId);

      if (!call) {
        twiml.say({
          voice: 'Polly.Aditi', // Hindi female voice
          language: 'hi-IN'
        }, 'कॉल रिकॉर्ड नहीं मिला। कृपया बाद में प्रयास करें।'); // Call record not found. Please try again later.
        twiml.hangup();
        return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
      }

      // Initial greeting in Hindi
      twiml.say({
        voice: 'Polly.Aditi',
        language: 'hi-IN'
      }, `नमस्ते ${call.contactName || 'जी'}, मैं ज़ैप्लो से बात कर रहा हूँ। कृपया मुझे बताएं कि मैं आपकी कैसे मदद कर सकता हूँ?`);

      // Add gather with speech recognition for Hindi
      const gather = twiml.gather({
        input: ['speech'],
        language: 'hi-IN',
        speechTimeout: 'auto',
        action: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/ai-conversation?callId=${callId}`,
        method: 'POST'
      });

      // Add a fallback in case the user doesn't respond
      twiml.redirect({
        method: 'POST'
      }, `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/ai-conversation?callId=${callId}&fallback=true`);

    }
    // If user spoke something and we need to respond
    else if (speechResult) {
      await connectDB();
      const call = await Call.findById(callId);

      if (!call) {
        twiml.say({
          voice: 'Polly.Aditi',
          language: 'hi-IN'
        }, 'कॉल रिकॉर्ड नहीं मिला। कृपया बाद में प्रयास करें।');
        twiml.hangup();
        return new NextResponse(twiml.toString(), { headers: { 'Content-Type': 'text/xml' } });
      }

      // Update the call with the conversation so far
      const currentTranscript = call.transcription || '';
      call.transcription = currentTranscript + `User: ${speechResult}\n`;
      await call.save();

      try {
        // Call OpenAI for a response
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a helpful AI assistant for Zapllo.
                        The user is speaking in Hindi or Hinglish.
                        Respond to them in the same language they're using.
                        Keep your responses short and conversational (under 3 sentences).
                        If they're asking about services or want to speak to a human,
                        tell them someone will contact them shortly and ask if there's anything
                        specific they'd like us to know before ending the call.
                        Context about the person: ${call.contactName ? `Their name is ${call.contactName}.` : ''}
                        ${call.customMessage ? `Relevant information: ${call.customMessage}` : ''}`
            },
            { role: "user", content: speechResult }
          ],
          max_tokens: 150,
        });

        const aiResponse = completion.choices[0].message.content || "मुझे खेद है, मैं आपकी बात नहीं समझ सका।";

        // Update call with AI response
        call.transcription = call.transcription + `AI: ${aiResponse}\n`;
        await call.save();

        // Speak the AI response
        twiml.say({
          voice: 'Polly.Aditi',
          language: 'hi-IN'
        }, aiResponse);

        // Continue the conversation
        const gather = twiml.gather({
          input: ['speech'],
          language: 'hi-IN',
          speechTimeout: 'auto',
          action: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/ai-conversation?callId=${callId}`,
          method: 'POST'
        });

        // Add a fallback
        twiml.redirect({
          method: 'POST'
        }, `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/ai-conversation?callId=${callId}&fallback=true`);

      } catch (error) {
        console.error("OpenAI API error:", error);
        twiml.say({
          voice: 'Polly.Aditi',
          language: 'hi-IN'
        }, 'मुझे खेद है, तकनीकी समस्या के कारण मैं अभी आपकी सहायता नहीं कर सकता। हम जल्द ही आपसे संपर्क करेंगे।');
        twiml.hangup();
      }
    }
    // Fallback case or hangup
    else {
      const isFallback = url.searchParams.get('fallback') === 'true';

      if (isFallback) {
        twiml.say({
          voice: 'Polly.Aditi',
          language: 'hi-IN'
        }, 'मुझे आपका कोई जवाब नहीं मिला। हम आपसे जल्द ही संपर्क करेंगे। धन्यवाद।');
        twiml.hangup();
      } else {
        twiml.say({
          voice: 'Polly.Aditi',
          language: 'hi-IN'
        }, 'धन्यवाद! हम आपसे जल्द ही संपर्क करेंगे।');
        twiml.hangup();
      }
    }

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error("Error in AI conversation handler:", error);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'Polly.Aditi',
      language: 'hi-IN'
    }, 'मुझे खेद है, एक त्रुटि हुई है। हम आपसे जल्द ही संपर्क करेंगे।');
    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}
