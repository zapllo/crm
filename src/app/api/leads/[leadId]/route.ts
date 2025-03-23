import { NextRequest, NextResponse } from "next/server";
import Lead from "@/models/leadModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";

export async function PATCH(request: NextRequest, { params }: { params: { leadId: string } }) {
    try {
        await connectDB();

        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { remark } = await request.json();
        if (!remark) {
            return NextResponse.json({ error: "Remark is required" }, { status: 400 });
        }

        const lead = await Lead.findById(params.leadId);
        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const timelineEntry = {
            stage: "Followup Closed",
            action: "Closed",
            remark,
            movedBy: userId,
            timestamp: new Date(),
        };

        lead.timeline.push(timelineEntry);
        await lead.save();

        return NextResponse.json({ message: "Timeline updated successfully", timelineEntry }, { status: 200 });
    } catch (error) {
        console.error("Error updating lead timeline:", error);
        return NextResponse.json({ error: "Failed to update timeline" }, { status: 500 });
    }
}
