import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Pipeline from "@/models/pipelineModel";

// Define the Stage interface
interface Stage {
    _id: string;
    name: string;
    color: string;
}

// PATCH /api/pipelines/:pipelineId/stages/:stageId
export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string, stageId: string }> }
) {
    try {
        const id = (await params).id
        const stageId = (await params).stageId
        const { newName }: { newName: string } = await request.json();

        // Connect to the database
        await connectDB();

        // Find the pipeline
        const pipeline = await Pipeline.findById(id);

        if (!pipeline) {
            return NextResponse.json({ message: "Pipeline not found" }, { status: 404 });
        }

        // Find the stage in both openStages and closeStages
        let stage = null;

        // Try to find the stage in openStages
        stage = pipeline.openStages.find((st: Stage) => st._id.toString() === stageId);

        // If not found in openStages, try closeStages
        if (!stage) {
            stage = pipeline.closeStages.find((st: Stage) => st._id.toString() === stageId);
        }

        if (!stage) {
            return NextResponse.json({ message: "Stage not found" }, { status: 404 });
        }

        // Update the stage name
        stage.name = newName;

        // Mark the modified array to ensure Mongoose saves the changes
        pipeline.markModified("openStages");
        pipeline.markModified("closeStages");

        await pipeline.save();

        return NextResponse.json({ message: "Stage name updated", pipeline });
    } catch (error) {
        console.error("Error updating stage:", error);
        return NextResponse.json({ message: "Failed to update stage" }, { status: 500 });
    }
}
// DELETE /api/pipelines/:pipelineId/stages/:stageId
export async function DELETE(request: Request,
    { params }: { params: Promise<{ id: string, stageId: string }> }
) {
    try {
        const id = (await params).id
        const stageId = (await params).stageId
        // Connect to the database
        await connectDB();

        // Find the pipeline
        const pipeline = await Pipeline.findById(id);

        if (!pipeline) {
            return new Response("Pipeline not found", { status: 404 });
        }

        // Remove the stage from both openStages and closeStages
        pipeline.openStages = pipeline.openStages.filter((st: Stage) => st._id.toString() !== stageId);
        pipeline.closeStages = pipeline.closeStages.filter((st: Stage) => st._id.toString() !== stageId);

        await pipeline.save();

        return new Response("Stage deleted", { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Failed to delete stage", { status: 500 });
    }
}
