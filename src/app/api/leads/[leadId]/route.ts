import { NextRequest, NextResponse } from "next/server";
import Lead from "@/models/leadModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";

export async function PATCH(req: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const leadId = (await params).leadId
        await connectDB();

        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { stage, action, remark } = await req.json();

        if (!remark) {
            return NextResponse.json({ error: "Remark is required" }, { status: 400 });
        }

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Create timeline entry using the stage provided
        const timelineEntry = {
            stage: stage || "Update", // Default to "Update" if no stage provided
            action: action || "Updated",
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

// New PUT method for editing leads
export async function PUT(req: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const leadId = (await params).leadId
        await connectDB();

        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const updateData = await req.json();

        // Fields that can be updated
        const allowedFields = [
            'title', 'description', 'product', 'contact',
            'amount', 'closeDate', 'assignedTo', 'pipeline',
            'stage', 'files', 'audioRecordings', 'links',
            'source', 'organization', 'customFieldValues'
        ];

        // Only update allowed fields
        const fieldsToUpdate: Record<string, any> = {};
        for (const field of allowedFields) {
            if (field in updateData) {
                fieldsToUpdate[field] = updateData[field];
            }
        }

        // If there's a stage change, record it in the timeline
        if (updateData.stage && updateData.stage !== lead.stage) {
            const timelineEntry = {
                stage: updateData.stage,
                action: "Updated",
                remark: updateData.remark || "Lead information updated",
                movedBy: userId,
                timestamp: new Date(),
            };

            lead.timeline.push(timelineEntry);
        } else if (Object.keys(fieldsToUpdate).length > 0) {
            // General update entry if fields were changed but stage remained the same
            const timelineEntry = {
                stage: lead.stage,
                action: "Updated",
                remark: updateData.remark || "Lead information updated",
                movedBy: userId,
                timestamp: new Date(),
            };

            lead.timeline.push(timelineEntry);
        }

        // Update the lead with all the allowed fields
        Object.assign(lead, fieldsToUpdate);
        await lead.save();

        return NextResponse.json({
            message: "Lead updated successfully",
            lead
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating lead:", error);
        return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
    }
}

// DELETE method for removing leads
export async function DELETE(req: Request,
    { params }: { params: Promise<{ leadId: string }> }
) {
    try {
        const leadId = (await params).leadId
        await connectDB();

        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if lead exists
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        // Delete the lead
        await Lead.findByIdAndDelete(leadId);

        return NextResponse.json({
            message: "Lead deleted successfully"
        }, { status: 200 });
    } catch (error) {
        console.error("Error deleting lead:", error);
        return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
    }
}
