import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/userModel";
import QuotationModel from "@/models/quotationModel";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";

// Function to send webhook notification (similar to the one in your leads API)
const sendWebhookNotification = async (
  phoneNumber: string,
  country: string = "IN", // Default to India, you might want to make this dynamic
  templateName: string,
  bodyVariables: string[]
) => {
  const payload = {
    phoneNumber,
    country,
    bodyVariables,
    templateName,
  };
  console.log(payload, 'payload');
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

export async function POST(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    await connectDB();

    // 1. Get userId from token
    const userId = getDataFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user from DB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organization) {
      return NextResponse.json({ error: "Missing organization" }, { status: 400 });
    }

    const quotationId = id;

    // Safely parse the request body
    let whatsappNumber, message;
    try {
      const body = await req.json();
      whatsappNumber = body.whatsappNumber;
      message = body.message;
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate input
    if (!whatsappNumber) {
      return NextResponse.json(
        { error: "WhatsApp number is required" },
        { status: 400 }
      );
    }

    // Find quotation
    const quotation = await QuotationModel.findOne({
      _id: quotationId,
      organization: user.organization,
    })
      .populate("creator", "firstName lastName email")
      .populate("contact", "firstName lastName email")
      .populate("lead", "title");

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Update status from draft to sent if needed
    if (quotation.status === 'draft') {
      quotation.status = 'sent';
      await quotation.save();
    }

    // Format the date in a readable format
    const formattedDate = new Date(quotation.validUntil).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });

    // Format the currency
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quotation.currency || 'USD',
    }).format(quotation.total);

    // Create the share link
    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://crm.zapllo.com'}/share/quotation/${quotation.publicAccessToken}`;

    // Send WhatsApp message using webhook
    const templateName = 'quotation_shared'; // Use your actual template name
    const contactName = quotation.contact && typeof quotation.contact === 'object' && 'firstName' in quotation.contact
      ? `${String(quotation.contact.firstName)} ${('lastName' in quotation.contact) ? String(quotation.contact.lastName) : ''}`
      : "Client";
    const senderName = quotation.creator && typeof quotation.creator === 'object' && 'firstName' in quotation.creator
      ? String(quotation.creator.firstName)
      : "Sender";

    // Body variables need to match your WhatsApp template
    const bodyVariables = [
      contactName,                    // Customer name
      senderName,                     // Sender name
      quotation.quotationNumber,      // Quotation number
      quotation.title,                // Quotation title
      formattedAmount,                // Total amount
      formattedDate,                  // Valid until date
      shareLink                       // Share link
    ];

    // Send the WhatsApp notification
    await sendWebhookNotification(
      whatsappNumber,
      "IN", // Country code, make dynamic if needed
      templateName,
      bodyVariables
    );

    return NextResponse.json(
      { success: true, message: "Quotation sent via WhatsApp successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending quotation via WhatsApp:", error);
    return NextResponse.json(
      { error: "Failed to send quotation via WhatsApp" },
      { status: 500 }
    );
  }
}
