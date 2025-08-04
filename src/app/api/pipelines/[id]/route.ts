import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import Pipeline from "@/models/pipelineModel";
import { User } from "@/models/userModel";
import { NextResponse } from "next/server";



// GET handler
export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        const pipeline = await Pipeline.findById(id);

        if (!pipeline) {
            return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
        }

        return NextResponse.json(pipeline, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch pipeline" }, { status: 500 });
    }
}


// PATCH handler
export async function PATCH(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        // Get userId from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch user
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        // Parse request body
        const body = await req.json();
        const { name, openStages, closeStages, customFields } = body;

        // Validate close stages for won/lost
        const formattedCloseStages = closeStages?.map((stage: any) => ({
            ...stage,
            won: stage.won || false,
            lost: stage.lost || false,
        }));

        // Update pipeline only if it belongs to the same organization
        const updatedPipeline = await Pipeline.findOneAndUpdate(
            { _id: id, organization: user.organization },
            {
                $set: {
                    ...(name && { name }),
                    ...(openStages && { openStages }),
                    ...(formattedCloseStages && { closeStages: formattedCloseStages }),
                    ...(customFields && { customFields }),
                },
            },
            { new: true }
        );

        if (!updatedPipeline) {
            return NextResponse.json({ error: "Pipeline not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json(updatedPipeline, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update pipeline" }, { status: 500 });
    }
}




// DELETE handler
export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        const deletedPipeline = await Pipeline.findByIdAndDelete(id);

        if (!deletedPipeline) {
            return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Pipeline deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete pipeline" }, { status: 500 });
    }
}
