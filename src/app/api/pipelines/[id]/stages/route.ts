import connectDB from "@/lib/db";
import Pipeline from "@/models/pipelineModel";
import { NextRequest } from "next/server";

// POST /api/pipelines/:pipelineId/stages
export async function POST(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id

    try {

        const { name, type, color } = await request.json();

        // Connect to the database and find the pipeline
        await connectDB();
        const pipeline = await Pipeline.findById(id);

        if (!pipeline) {
            return new Response("Pipeline not found", { status: 404 });
        }

        const newStage = { name, type, color };

        if (type === "open") {
            pipeline.openStages.push(newStage);
        } else if (type === "close") {
            pipeline.closeStages.push(newStage);
        } else {
            return new Response("Invalid stage type", { status: 400 });
        }

        await pipeline.save();

        return new Response(JSON.stringify(pipeline), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response("Failed to add stage", { status: 500 });
    }
}
