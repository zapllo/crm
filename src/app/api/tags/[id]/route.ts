import connectDB from "@/lib/db";
import Tag from "@/models/leadTagsModel";
import { NextResponse } from "next/server";

export async function PATCH(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();
        const body = await req.json();
        const { name, color } = body;

        const updatedTag = await Tag.findByIdAndUpdate(
            id,
            { name, color },
            { new: true }
        );

        if (!updatedTag) {
            return NextResponse.json({ error: "Tag not found" }, { status: 404 });
        }

        return NextResponse.json(updatedTag, { status: 200 });
    } catch (error) {
        console.error("Failed to update tag:", error);
        return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
    }
}


export async function DELETE(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        const deletedTag = await Tag.findByIdAndDelete(id);

        if (!deletedTag) {
            return NextResponse.json({ error: "Tag not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Tag deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Failed to delete tag:", error);
        return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
    }
}
