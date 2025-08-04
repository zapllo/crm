import { NextResponse } from "next/server";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import Form from "@/models/formBuilderModel";

// Function to send webhook notification (reusing the pattern from quotations)
const sendWebhookNotification = async (
  phoneNumber: string,
  country: string = "IN", // Default to India
  templateName: string,
  bodyVariables: string[]
) => {
  const payload = {
    phoneNumber,
    country,
    bodyVariables,
    templateName,
  };

  try {
    const response = await fetch('https://zapllo.com/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(`Webhook API error: ${responseData.message}`);
    }

    console.log('Webhook notification sent successfully:', payload);
    return true;
  } catch (error) {
    console.error('Error sending webhook notification:', error);
    throw new Error('Failed to send webhook notification');
  }
};

export async function POST(req: Request) {
  try {
    await connectDB();

    // Get user data from token
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request data
    const body = await req.json();
    const { formId, formName, phoneNumber, recipientName, message, formUrl } = body;

    // Validate form exists and belongs to the user
    const form = await Form.findOne({
      _id: formId,
      organization: user.organization
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Format phone number (remove spaces, +, etc. if needed)
    const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '');

    // Template name should match your Interakt template
    const templateName = 'form_shared';

    // Body variables for the WhatsApp template
    const bodyVariables = [
      recipientName || "there",                    // Recipient name
      `${user.firstName} ${user.lastName}`,        // Sender name
      formName || form.name || "Form",             // Form name
      message || "Please fill out this form.",     // Custom message or default
      formUrl                                      // Form URL
    ];

    // Send WhatsApp notification
    await sendWebhookNotification(
      cleanPhoneNumber,
      "IN", // Country code, make dynamic if needed
      templateName,
      bodyVariables
    );

    return NextResponse.json({
      success: true,
      message: "Form shared via WhatsApp successfully"
    });

  } catch (error) {
    console.error("Error sharing form via WhatsApp:", error);
    return NextResponse.json(
      { error: "Failed to share form via WhatsApp" },
      { status: 500 }
    );
  }
}
