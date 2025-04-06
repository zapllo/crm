import { NextRequest, NextResponse } from "next/server";
import Ticket from "@/models/ticketModel";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";

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