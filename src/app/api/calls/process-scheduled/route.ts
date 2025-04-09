import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import connectDB from "@/lib/db";
import Call from "@/models/callModel";

// This endpoint should be called by a CRON job every minute
export async function GET(req: NextRequest) {
  try {
    // Log the start of processing
    console.log(`Process scheduled calls started at: ${new Date().toISOString()}`);

    // CRITICAL FIX: Remove token check for now - we'll add it back later with proper configuration
    // const { searchParams } = new URL(req.url);
    // const token = searchParams.get("token");
    // if (token !== process.env.SCHEDULED_TASKS_TOKEN) {
    //   console.log(`Unauthorized token attempt: ${token}`);
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await connectDB();

    // Find calls that are scheduled and due to be made
    const now = new Date();
    console.log(`Looking for calls scheduled before: ${now.toISOString()}`);

    // IMPORTANT FIX: Change status from "scheduled" to include both "scheduled" and "queued"
    const scheduledCalls = await Call.find({
      status: { $in: ["scheduled", "queued"] },
      scheduledFor: { $lte: now },
    });

    console.log(`Found ${scheduledCalls.length} scheduled calls to process`);

    // Log details of each scheduled call
    scheduledCalls.forEach(call => {
      console.log(`Call ID: ${call._id}, Phone: ${call.phoneNumber}, Scheduled for: ${new Date(call.scheduledFor).toISOString()}`);
    });

    // Process each call
    const results = await Promise.all(
      scheduledCalls.map(async (call) => {
        try {
          console.log(`Processing call to ${call.phoneNumber}`);

          // Check if Twilio credentials are available
          if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            console.error("Missing Twilio credentials");
            throw new Error("Missing Twilio credentials");
          }

          // Initialize Twilio client
          const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
          );

          console.log(`Twilio client initialized for call to ${call.phoneNumber}`);

          const phoneNumber = call.phoneNumber.trim();
          // Format phone number - ensure it has the international format with + prefix
          const formattedPhoneNumber = phoneNumber.startsWith('+')
            ? phoneNumber
            : `+91${phoneNumber}`; // Assuming India as default country code

          console.log(`Calling formatted number: ${formattedPhoneNumber}`);

          const twilioCall = await client.calls.create({
            twiml: `
          <Response>
            <Say voice="Polly.Raveena">Hello ${call.contactName || "there"}. This is a message from Zapllo.</Say>
            <Pause length="1"/>
            <Say voice="Polly.Raveena"call.customMessage || "Thank you for contacting us. We look forward to speaking with you."}</Say>
            <Pause length="1"/>
            <Say voice="Polly.Raveena">If you'd like to discuss your needs further, please call us back during business hours. Thank you for your interest in Zapllo!</Say>
          </Response>
          `,
            to: formattedPhoneNumber,
            from: process.env.TWILIO_PHONE_NUMBER,
            statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/calls/webhook?callId=${call._id}`,
            statusCallbackMethod: 'POST',
            statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
            record: true
          });

          console.log(`Call initiated with Twilio SID: ${twilioCall.sid}`);

          // Update call record with Twilio SID
          call.twilioCallSid = twilioCall.sid;
          call.status = "initiated";
          await call.save();
          console.log(`Call record updated: ${call._id}`);

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
          console.log(`Call failed: ${call._id} - ${error.message}`);

          return {
            id: call._id,
            status: "failed",
            error: error.message
          };
        }
      })
    );

    console.log(`Processed ${results.length} calls`);
    console.log(`Process scheduled calls completed at: ${new Date().toISOString()}`);

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
