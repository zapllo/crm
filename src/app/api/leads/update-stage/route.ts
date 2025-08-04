import Lead from "@/models/leadModel";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import Pipeline from "@/models/pipelineModel";
import { createNotification } from "@/lib/notificationService";
import mongoose from "mongoose";


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { leadId, newPipeline, newStage, remark } = body;
        const userId = await getDataFromToken(req); // Get logged-in user ID

        if (!leadId || !newStage || !remark || !userId) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        await connectDB();

        // Find the lead
        const lead = await Lead.findById(leadId).populate("pipeline");
        if (!lead) {
            return new Response(JSON.stringify({ error: "Lead not found" }), { status: 404 });
        }

        const pipeline = await Pipeline.findById(newPipeline);
        if (!lead) {
            return new Response(JSON.stringify({ error: "Lead not found" }), { status: 404 });
        }



        let actionMessage = `Stage changed to ${newStage}`;

        // Check if the pipeline needs to be updated
        if (newPipeline && newPipeline !== lead.pipeline.toString()) {
            lead.pipeline = newPipeline;
            actionMessage = `Pipeline changed to ${pipeline.name}  and stage changed to ${newStage}`;
        }

        // Update lead stage
        lead.stage = newStage;

        // Add the timeline entry
        const timelineEntry = {
            stage: newStage,
            action: actionMessage,
            remark,
            movedBy: userId,
            timestamp: new Date(),
        };

        lead.timeline.push(timelineEntry);

        // Save the updated lead
        await lead.save();

        // Add notification
        await createNotification({
            orgId: lead.organization,
            recipientId: lead.assignedTo || userId,
            actorId: new mongoose.Types.ObjectId(userId),
            action: "stage_change",
            entityType: "lead",
            entityId: lead._id,
            entityName: lead.title,
            message: actionMessage,
            url: `/CRM/leads/${lead._id}`,
        });

        return new Response(
            JSON.stringify({ message: "Lead updated successfully", timeline: lead.timeline }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Error updating lead:", error);
        return new Response(JSON.stringify({ error: "Failed to update lead" }), { status: 500 });
    }
}
