import connectDB from "@/lib/db";
import Pipeline from "@/models/pipelineModel";
import { NextResponse } from "next/server";

// PATCH handler for adding/updating custom fields
export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id

    try {
        await connectDB();
        const { customField } = await request.json(); // Expect a single custom field in the request body

        if (!customField) {
            return NextResponse.json(
                { error: "Custom field is required." },
                { status: 400 }
            );
        }

        // Update pipeline by appending the new field
        const updatedPipeline = await Pipeline.findByIdAndUpdate(
            id,
            { $push: { customFields: customField } }, // Append the field to the array
            { new: true }
        );

        if (!updatedPipeline) {
            return NextResponse.json(
                { error: "Pipeline not found." },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedPipeline, { status: 200 });
    } catch (error) {
        console.error("Failed to update pipeline custom fields:", error);
        return NextResponse.json(
            { error: "Failed to update pipeline custom fields." },
            { status: 500 }
        );
    }
}
