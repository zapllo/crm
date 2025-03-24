import connectDB from "@/lib/db";
import followupModel from "@/models/followupModel";
import { NextResponse } from "next/server";

export async function PATCH(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        const data = await req.json();

        const updatedFollowup = await followupModel.findByIdAndUpdate(id, data, { new: true });
        if (!updatedFollowup) {
            return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
        }
        return NextResponse.json(updatedFollowup, { status: 200 });
    } catch (error) {
        console.error("Error updating follow-up:", error);
        return NextResponse.json({ error: "Failed to update follow-up" }, { status: 500 });
    }
}

export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        await followupModel.findByIdAndDelete(id);
        return NextResponse.json({ message: "Follow-up deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting follow-up:", error);
        return NextResponse.json({ error: "Failed to delete follow-up" }, { status: 500 });
    }
}

