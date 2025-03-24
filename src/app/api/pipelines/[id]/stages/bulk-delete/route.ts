import connectDB from "@/lib/db";
import pipelineModel from "@/models/pipelineModel";
import { NextRequest } from "next/server";

// Define the Stage interface
interface Stage {
  _id: string;
  name: string;
  color: string;
}

interface BulkDeleteRequest {
  selectedStages: string[];
}

export async function PATCH(request: Request,
  { params }: { params: Promise<{ pipelineId: string }> }
) {
  try {
    const pipelineId = (await params).pipelineId
    const { selectedStages }: BulkDeleteRequest = await request.json();

    await connectDB();

    const pipeline = await pipelineModel.findById(pipelineId);

    if (!pipeline) {
      return new Response("Pipeline not found", { status: 404 });
    }

    // Filter stages with explicit type for `stage`
    pipeline.openStages = pipeline.openStages.filter((stage: Stage) => !selectedStages.includes(stage._id.toString()));
    pipeline.closeStages = pipeline.closeStages.filter((stage: Stage) => !selectedStages.includes(stage._id.toString()));

    await pipeline.save();

    return new Response("Stages deleted", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Failed to delete stages", { status: 500 });
  }
}
