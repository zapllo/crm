import { NextRequest, NextResponse } from "next/server";
import Ticket from "@/models/ticketModel";
import connectDB from "@/lib/db";



// Get a single ticket by ID
export async function GET(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    await connectDB();

    // Find the ticket by ticketId
    const ticket = await Ticket.findOne({ ticketId: id })
      .populate('userId', 'firstName lastName email whatsappNo')
      .populate('organizationId', 'companyName industry')
      .populate('assignedTo', 'firstName lastName email');

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket details" },
      { status: 500 }
    );
  }
}

// Add a reply to a ticket from admin/agent (no auth)
export async function POST(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
        await connectDB();

        const { content, attachments, status, assignedTo, agentName } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: "Message content is required" },
                { status: 400 }
            );
        }

        if (!agentName) {
            return NextResponse.json(
                { error: "Agent name is required" },
                { status: 400 }
            );
        }

        // Find the ticket by ticketId (not MongoDB _id)
        const ticket = await Ticket.findOne({ ticketId: id });

        if (!ticket) {
            return NextResponse.json(
                { error: "Ticket not found" },
                { status: 404 }
            );
        }

        // Add the new message
        ticket.messages.push({
            sender: 'agent',
            content,
            timestamp: new Date(),
            agent: agentName, // Use the provided agent name
            attachments: attachments || []
        });

        // Update ticket status if provided
        if (status && ['open', 'pending', 'closed'].includes(status)) {
            ticket.status = status;
        }

        // Update assigned agent if provided
        if (assignedTo) {
            ticket.assignedTo = assignedTo;
        }

        // Update the ticket
        await ticket.save();

        return NextResponse.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error("Error adding admin reply:", error);
        return NextResponse.json(
            { error: "Failed to add reply" },
            { status: 500 }
        );
    }
}
