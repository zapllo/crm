import { NextRequest, NextResponse } from "next/server";
import Ticket from "@/models/ticketModel";
import connectDB from "@/lib/db";

// Get all tickets across all organizations - No auth check
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const organizationId = searchParams.get('organizationId');

    // Build query filters
    const filter: any = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (organizationId) filter.organizationId = organizationId;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get tickets with pagination and populate relevant fields
    const tickets = await Ticket.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email')
      .populate('organizationId', 'companyName')
      .populate('assignedTo', 'firstName lastName email');

    // Get total count for pagination info
    const totalCount = await Ticket.countDocuments(filter);

    return NextResponse.json({
      tickets,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
