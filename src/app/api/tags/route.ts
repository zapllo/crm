import connectDB from "@/lib/db";
import Tag from "@/models/leadTagsModel";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const tags = await Tag.find();
        return NextResponse.json(tags, { status: 200 });
    } catch (error) {
        console.error("Failed to fetch tags:", error);
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();
        const { name, color } = body;

        if (!name || !color) {
            return NextResponse.json({ error: "Name and color are required" }, { status: 400 });
        }

        const newTag = await Tag.create({ name, color });
        return NextResponse.json(newTag, { status: 201 });
    } catch (error) {
        console.error("Failed to create tag:", error);
        return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
    }
}
