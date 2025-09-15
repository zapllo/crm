import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { sendEmail } from "@/lib/sendEmail";
import Call from "@/models/callModel";
import connectDB from "@/lib/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Map agentType to ElevenLabs agent IDs
const AGENT_ID_MAP: Record<string, string> = {
  support: process.env.ZAPLLO_AGENT_SUPPORT_ID!,
  sales: process.env.ZAPLLO_AGENT_SALES_ID!,
  booking: process.env.ZAPLLO_AGENT_BOOKING_ID!,
  qualifier: process.env.ZAPLLO_AGENT_QUALIFIER_ID!,
};

async function initiateCallImmediately(
  fullName: string,
  whatsappNumber: string,
  responseText: string,
  agentType: string
) {
  await connectDB();

  const agentId = AGENT_ID_MAP[agentType] || process.env.ZAPLLO_AGENT_SUPPORT_ID!;

  try {
    const call = new Call({
      contactId: "000000000000000000000000",
      phoneNumber: whatsappNumber,
      direction: "outbound",
      status: "queued",
      twilioCallSid: "pending",
      notes: "Automated response call",
      organizationId: process.env.ORGANIZATION_ID || "000000000000000000000000",
      userId: process.env.SYSTEM_USER_ID || "000000000000000000000000",
      contactName: fullName,
      customMessage: responseText,
      scheduledFor: new Date(),
      startTime: new Date(),
      cost: 0
    });
    await call.save();

    const formattedPhone = whatsappNumber.startsWith("+")
      ? whatsappNumber
      : `+91${whatsappNumber.trim()}`;

    const response = await fetch("https://api.elevenlabs.io/v1/convai/twilio/outbound_call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        agent_id: agentId,
        agent_phone_number_id: process.env.ELEVENLABS_PHONE_ID!,
        to_number: formattedPhone
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs call failed: ${errorText}`);
      call.status = "failed";
      call.notes = `Eleven Labs Error: ${errorText}`;
      await call.save();
      return { id: call._id, status: "failed" };
    }

    const data = await response.json();
    call.status = "initiated";
    call.notes = `Call initiated via ElevenLabs`;
    call.elevenLabsCallId = data.call_id;
    await call.save();

    return { id: call._id, status: "initiated", callId: data.call_id };
  } catch (error) {
    console.error("Error initiating call:", error);
    throw error;
  }
}

async function sendWebhookNotification(
  phoneNumber: string,
  fullName: string,
  responseText: string
) {
  try {
    // Clean up the responseText to remove any special characters
    let cleanedMessage = responseText
      .replace(/[^\w\s.,!?;:()\-'"]/g, '') // Remove special characters
      .trim();

    // Further limit the message length to be safe
    // WhatsApp templates often have limits around 150-250 chars per variable
    let messageContent = cleanedMessage.substring(0, 250);

    // Create a fallback message if the AI response is problematic
    if (!messageContent) {
      messageContent = `Thank you for reaching out, ${fullName}. We're reviewing your inquiry and will get back to you shortly. A member of our team will call you momentarily.`;
    }

    const templateName = "personalized_response_x6";
    const bodyVariables = [
      fullName,
      messageContent,
      "Zapllo Team"
    ];

    const payload = {
      phoneNumber,
      country: "IN",
      bodyVariables,
      templateName,
    };

    console.log("Sending webhook with payload:", JSON.stringify(payload));

    const response = await fetch("https://zapllo.com/api/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Try to get the error text, fallback to status code if no JSON
      const errorText = await response.text();
      console.error(`Webhook API full response: ${errorText}`);

      // If still failing, try a very simple fallback message
      if (response.status >= 400) {
        const simplePayload = {
          phoneNumber,
          country: "IN",
          bodyVariables: [
            fullName,
            "Thank you for contacting Zapllo. We will call you shortly.",
            "Zapllo Team"
          ],
          templateName,
        };

        console.log("Trying fallback webhook with simplified payload");

        const fallbackResponse = await fetch("https://zapllo.com/api/webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(simplePayload),
        });

        if (!fallbackResponse.ok) {
          throw new Error(`Fallback webhook also failed: ${fallbackResponse.status}`);
        }

        console.log("Fallback WhatsApp notification sent successfully");
        return true;
      }

      throw new Error(`Webhook API error: Status ${response.status}`);
    }

    console.log("WhatsApp notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending webhook notification:", error);
    return false;
  }
}


export async function POST(request: NextRequest) {
  try {
    const { fullName, email, whatsappNumber, description, agentType } = await request.json();

    if (!fullName || !email || !whatsappNumber || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `
      Generate a personalized response for a potential customer who has contacted Zapllo.
      Customer's name: ${fullName}
      Inquiry: ${description}
      Response should be professional, warm, and one paragraph long.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content || `Thank you for contacting Zapllo, ${fullName}.`;

    // Send email
    await sendEmail({
      to: email,
      subject: "Thank you for contacting Zapllo",
      text: responseText,
      html: `<p>${responseText}</p>`
    });

    // WhatsApp webhook notification
    await sendWebhookNotification(whatsappNumber, fullName, responseText);

    // Trigger call with agentType
    const callResult = await initiateCallImmediately(fullName, whatsappNumber, responseText, agentType);

    return NextResponse.json({
      success: true,
      message: "Form submitted and automation triggered",
      responseText,
      callResult,
    });
  } catch (error: any) {
    console.error("Error in POST /api/contact:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
