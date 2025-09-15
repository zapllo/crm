import { NextRequest, NextResponse } from "next/server";
import Ticket from "@/models/ticketModel";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";
import { sendTicketCreationEmail } from "@/lib/emailTemplates";

// Get all tickets for current user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 1. Get userId from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user from DB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organization) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // Get user's tickets
    const tickets = await Ticket.find({
      userId: userId,
      organizationId: user.organization
    }).sort({ updatedAt: -1 });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}

const sendWebhookNotification = async (
  phoneNumber: string,
  country: string,
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
  } catch (error) {
      console.error('Error sending webhook notification:', error);
      throw new Error('Failed to send webhook notification');
  }
};


// Create a new ticket
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // 1. Get userId from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user from DB
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organization) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    const { subject, message, category, priority } = await request.json();

    // Validate required fields
    if (!subject || !message || !category || !priority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new ticket
    const ticket = new Ticket({
      subject,
      priority,
      category,
      userId: userId,
      organizationId: user.organization,
      messages: [
        {
          sender: 'user',
          content: message,
          timestamp: new Date()
        }
      ]
    });

    await ticket.save();


 // Send email notification to the user
 try {
  await sendTicketCreationEmail({
    to: user.email,
    firstName: user.firstName,
    ticketDetails: {
      ticketId: ticket._id.toString(),
      subject: subject,
      category: category,
      priority: priority,
      message: message
    }
  });
  console.log("Ticket creation email notification sent successfully");
} catch (error) {
  console.error("Error sending ticket email notification:", error);
  // Continue execution, don't fail the API response
}

// Send WhatsApp notification if the user has a WhatsApp number
if (user.whatsappNo) {
  try {
    const templateName = 'ticket_creation';
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
    const bodyVariables = [
      `${user.firstName}`,
      ticket._id.toString(),
      subject,
      category,
      priority,
      today,
      "crm.zapllo.com/help/tickets"
    ];

    await sendWebhookNotification(
      `${user.whatsappNo}`,
      "IN",
      templateName,
      bodyVariables
    );
    console.log("Ticket creation WhatsApp notification sent successfully");
  } catch (error) {
    console.error("Error sending ticket WhatsApp notification:", error);
    // Continue execution, don't fail the API response
  }
}
    // Here you would typically also send notifications to support staff
    // about the new ticket

    return NextResponse.json({
      success: true,
      ticket
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
