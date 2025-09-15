import { NextResponse } from "next/server";
import followupModel from "@/models/followupModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";

export async function GET(request: Request) {
    try {
        await connectDB();

        // Extract user ID from token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get leadId from query params
        const { searchParams } = new URL(request.url);
        const leadId = searchParams.get("leadId");

        if (!leadId) {
            return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
        }

        // Find user and get their organization
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        // Fetch follow-ups for the given leadId, populating required fields
        const followups = await followupModel
            .find({ lead: leadId })
            .populate({
                path: "lead",
                populate: [
                    { path: "contact", select: "firstName lastName email whatsappNo" },
                    { path: "assignedTo", select: "firstName lastName email" },  // ✅ Added assignedTo
                ],
            })
            .populate({ path: "addedBy", select: "firstName lastName email" });

        return NextResponse.json(followups, { status: 200 });
    } catch (error) {
        console.error("Error fetching follow-ups:", error);
        return NextResponse.json({ error: "Failed to fetch follow-ups" }, { status: 500 });
    }
}
