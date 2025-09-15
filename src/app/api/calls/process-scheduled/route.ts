import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Call from "@/models/callModel";

export async function GET(req: NextRequest) {
  try {
    console.log(`Process scheduled calls started at: ${new Date().toISOString()}`);

    await connectDB();

    const now = new Date();
    console.log(`Looking for calls scheduled before: ${now.toISOString()}`);

    const scheduledCalls = await Call.find({
      status: { $in: ["scheduled", "queued"] },
      scheduledFor: { $lte: now },
    });

    console.log(`Found ${scheduledCalls.length} scheduled calls to process`);

    const results = await Promise.all(
      scheduledCalls.map(async (call) => {
        try {
          const formattedPhone = call.phoneNumber.startsWith("+")
            ? call.phoneNumber
            : `+91${call.phoneNumber.trim()}`;

          console.log(`Triggering Eleven Labs AI call to: ${formattedPhone}`);

          const response = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound_call", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "xi-api-key": process.env.ELEVENLABS_API_KEY!,
            },
            body: JSON.stringify({
              agent_id: process.env.ELEVENLABS_AGENT_ID!,
              agent_phone_number_id: process.env.ELEVENLABS_PHONE_ID!,
              to_number: formattedPhone,
              first_message: {
                role: "user",
                content: call.customMessage || `नमस्ते, Zapllo से बात करने के लिए धन्यवाद। कृपया बताएं हम आपकी कैसे मदद कर सकते हैं।`
              }
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Eleven Labs call failed: ${errorText}`);

            call.status = "failed";
            call.notes = `Eleven Labs Error: ${errorText}`;
            await call.save();

            return { id: call._id, status: "failed", error: errorText };
          }

          const data = await response.json();
          console.log(`Call started: ${call._id}, Eleven Labs call ID: ${data.call_id}`);

          call.status = "initiated";
          call.notes = `Call initiated via Eleven Labs`;
          call.elevenLabsCallId = data.call_id;
          await call.save();

          return { id: call._id, status: "initiated", callId: data.call_id };
        } catch (error: any) {
          console.error(`Error calling Eleven Labs for ${call.phoneNumber}:`, error);
          call.status = "failed";
          call.notes = `Error: ${error.message}`;
          await call.save();

          return { id: call._id, status: "failed", error: error.message };
        }
      })
    );

    console.log(`Processed ${results.length} calls`);
    return NextResponse.json({
      success: true,
      processedCalls: results,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Error processing scheduled calls:", error);
    return NextResponse.json(
      { error: "Failed to process scheduled calls", details: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
