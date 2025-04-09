import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import connectDB from "@/lib/db";
import Call from "@/models/callModel";

// This endpoint should be called by a CRON job every minute
export async function GET(req: NextRequest) {
  try {
    // Optional security token check
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (token !== process.env.SCHEDULED_TASKS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find calls that are scheduled and due to be made
    const now = new Date();
    const scheduledCalls = await Call.find({
      status: "scheduled",
      scheduledFor: { $lte: now },
    });

    console.log(`Found ${scheduledCalls.length} scheduled calls to process`);

    // Process each call
    const results = await Promise.all(
      scheduledCalls.map(async (call) => {
        try {
          // Initialize Twilio client
          const client = twilio(
            process.env.TWILIO_ACCOUNT_SID!,
            process.env.TWILIO_AUTH_TOKEN!
          );

          // Make the call
          const twilioCall = await client.calls.create({
            twiml: `
    <Response>
      <Say voice="alice">Hello ${call.contactName || "there"}. This is a message from Zapllo.</Say>
      <Pause length="1"/>
      <Say voice="alice">${call.customMessage || "Thank you for contacting us. We look forward to speaking with you."}</Say>
      <Pause length="1"/>
      <Say voice="alice">If you'd like to discuss your needs further, please call us back during business hours. Thank you for your interest in Zapllo!</Say>
    </Response>
  `,
            to: call.phoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER!,
            statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${call._id}`,
            statusCallbackMethod: 'POST',
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
            record: true
          });

          // Update call record with Twilio SID
          call.twilioCallSid = twilioCall.sid;
          call.status = "initiated";
          await call.save();

          return {
            id: call._id,
            status: "initiated",
            twilioCallSid: twilioCall.sid
          };
        } catch (error: any) {
          console.error(`Error making call to ${call.phoneNumber}:`, error);

          // Update call record with error
          call.status = "failed";
          call.notes = `Error: ${error.message}`;
          await call.save();

          return {
            id: call._id,
            status: "failed",
            error: error.message
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      processedCalls: results
    });
  } catch (error: any) {
    console.error("Error processing scheduled calls:", error);
    return NextResponse.json(
      { error: "Failed to process scheduled calls", details: error.message },
      { status: 500 }
    );
  }
}
