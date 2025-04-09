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
async function scheduleCall(fullName: string, whatsappNumber: string, responseText: string) {
  await connectDB();

  try {
    // Create a call record (will be picked up by scheduled task)
    const call = new Call({
      contactId: "000000000000000000000000", // Using a placeholder ObjectId since it's required
      phoneNumber: whatsappNumber,
      direction: "outbound",
      status: "queued", // Update to match your model's allowed statuses
      twilioCallSid: "pending",
      notes: "Automated response call",
      organizationId: process.env.ORGANIZATION_ID || "000000000000000000000000",
      userId: process.env.SYSTEM_USER_ID || "000000000000000000000000",
      contactName: fullName, // Add the contact name for the TwiML
      customMessage: responseText, // Add this field to your Call model
      scheduledFor: new Date(Date.now() + 2 * 60 * 1000), // Schedule for 2 mins from now
      startTime: new Date(),
      cost: 0
    });
    // Add extra fields that our Call model needs
    await call.save();

    console.log(`Scheduled call to ${whatsappNumber} in 5 minutes, ID: ${call._id}`);
    return call._id;
  } catch (error) {
    console.error("Error scheduling call:", error);
    throw error;
  }
}
// Function to send WhatsApp notification
async function sendWebhookNotification(
  phoneNumber: string,
  fullName: string,
  responseText: string
) {
  const templateName = "personalized_response_x6";
  // First line of response as WhatsApp preview, rest will be in the expanded message
  const messageContent = responseText.substring(0, 950); //
  const bodyVariables = [
    fullName,
    messageContent,
    "Zapllo Team"
  ];

  const payload = {
    phoneNumber,
    country: "IN", // Assuming India, adjust as needed
    bodyVariables,
    templateName,
  };

  try {
    const response = await fetch("https://zapllo.com/api/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(`Webhook API error: ${responseData.message}`);
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

    // Schedule a call in 5 minutes
    const callId = await scheduleCall(fullName, whatsappNumber, responseText);

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
      responseText,
      callId,
    });
  } catch (error: any) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process your request", details: error.message },
      { status: 500 }
    );
  }
}
