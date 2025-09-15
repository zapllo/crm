import { NextRequest, NextResponse } from "next/server";
import Ticket from "@/models/ticketModel";
import { User } from "@/models/userModel";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";

// Add a reply to a ticket
export async function POST(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
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
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        const { content, attachments } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: "Message content is required" },
                { status: 400 }
            );
        }

        const ticket = await Ticket.findOne({
            ticketId: id,
            userId: userId,
            organizationId: user.organization
        });

        if (!ticket) {
            return NextResponse.json(
                { error: "Ticket not found" },
                { status: 404 }
            );
        }

        // If the ticket was closed, reopen it when user adds a reply
        if (ticket.status === 'closed') {
            ticket.status = 'open';
        }

        // Add the new message
        ticket.messages.push({
            sender: 'user',
            content,
            timestamp: new Date(),
            attachments: attachments || []
        });

        // Update the ticket
        await ticket.save();

        // Here you would typically send notifications to support staff
        // about the new reply

        return NextResponse.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error("Error adding reply:", error);
        return NextResponse.json(
            { error: "Failed to add reply" },
            { status: 500 }
        );
    }
}