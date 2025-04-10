import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { sendEmail } from "@/lib/sendEmail";
import Call from "@/models/callModel";
import connectDB from "@/lib/db";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to create a call record that will be triggered later
// Change function name to better reflect its new purpose
async function initiateCallImmediately(fullName: string, whatsappNumber: string, responseText: string) {
  await connectDB();

  try {
    // Create and save call record with current time
    const call = new Call({
      contactId: "000000000000000000000000", // Using a placeholder ObjectId
      phoneNumber: whatsappNumber,
      direction: "outbound",
      status: "queued", // Will be picked up immediately
      twilioCallSid: "pending",
      notes: "Automated response call",
      organizationId: process.env.ORGANIZATION_ID || "000000000000000000000000",
      userId: process.env.SYSTEM_USER_ID || "000000000000000000000000",
      contactName: fullName,
      customMessage: responseText,
      scheduledFor: new Date(), // Schedule for NOW instead of future
      startTime: new Date(),
      cost: 0
    });
    await call.save();

    // Immediately trigger the call by calling the process endpoint
    const formattedPhone = whatsappNumber.startsWith("+")
      ? whatsappNumber
      : `+91${whatsappNumber.trim()}`;

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
          content: responseText || `नमस्ते, Zapllo से बात करने के लिए धन्यवाद। कृपया बताएं हम आपकी कैसे मदद कर सकते हैं।`
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Eleven Labs call failed: ${errorText}`);

      call.status = "failed";
      call.notes = `Eleven Labs Error: ${errorText}`;
      await call.save();

      return { id: call._id, status: "failed" };
    }

    const data = await response.json();
    console.log(`Call started: ${call._id}, Eleven Labs call ID: ${data.call_id}`);

    call.status = "initiated";
    call.notes = `Call initiated via Eleven Labs`;
    call.elevenLabsCallId = data.call_id;
    await call.save();

    console.log(`Initiated immediate call to ${whatsappNumber}, ID: ${call._id}`);
    return { id: call._id, status: "initiated", callId: data.call_id };
  } catch (error) {
    console.error("Error initiating call:", error);
    throw error;
  }
}

// Function to send WhatsApp notification
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
    // Parse request body
    const { fullName, email, whatsappNumber, description } = await request.json();

    // Validate required fields
    if (!fullName || !email || !whatsappNumber || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate personalized response using ChatGPT
    const prompt = `
      Generate a personalized response for a potential customer who has contacted Zapllo.
      Zapllo is a modern business communication platform that helps businesses engage with their customers through multiple channels.

      Customer's name: ${fullName}
      Customer's inquiry: ${description}

      Write a warm, friendly, and professional response that:
      1. Addresses them by name
      2. Shows understanding of their needs based on their description
      3. Explains how Zapllo can help them
      4. Invites them to a follow-up discussion
      5. Includes a thank you and sign-off from the Zapllo team

      Keep the tone conversational but professional. The response should be 1 paragraphs maximum.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content ||
      `Thank you for reaching out, ${fullName}. We'll review your inquiry about "${description}" and get back to you soon. - Zapllo Team`;
    console.log(responseText, 'response text?')
    // Send email response
    await sendEmail({
      to: email,
      subject: "Thank you for contacting Zapllo",
      text: responseText,
      html: `
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
            <div style="background-color: #f0f4f8; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <div style="padding: 20px; text-align: center;">
                        <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
                    </div>
                    <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
                        <h1 style="margin: 0; font-size: 20px;">Thank You for Contacting Us</h1>
                    </div>
                    <div style="padding: 20px;">
                        <div style="border-radius:8px; margin-top:4px; color:#000000; padding:16px; background-color:#ECF1F6">
                            ${responseText.replace(/\n/g, '<br/>')}
                        </div>

                        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e6e8eb;">
                            <p>We'll be reaching out to you shortly via WhatsApp, and you'll receive a call from us in about 5 minutes.</p>
                            <p>Best regards,<br>Zapllo Team</p>
                        </div>

                        <div style="text-align: center; margin-top: 20px;">
                            <a href="https://zapllo.com" style="background-color: #0C874B; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Our Website</a>
                        </div>

                        <p style="margin-top: 20px; text-align: center; font-size: 12px; color: #888888;">© ${new Date().getFullYear()} Zapllo. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </body>
      `,
    });


    // Send WhatsApp notification
    await sendWebhookNotification(
      whatsappNumber,
      fullName,
      responseText
    );

// In the POST function, replace this line:
// const callId = await scheduleCall(fullName, whatsappNumber, responseText);

// With this:
const callResult = await initiateCallImmediately(fullName, whatsappNumber, responseText);

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
      responseText,
      callResult,
    });
  } catch (error: any) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process your request", details: error.message },
      { status: 500 }
    );
  }
}
