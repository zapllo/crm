import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ContactTag from "@/models/contactTagModel";
import { Types } from "mongoose";

/**
 * GET    /api/contact-tags    => list all contact tags
 * POST   /api/contact-tags    => create a new contact tag
 * PATCH  /api/contact-tags    => update an existing contact tag (by ID)
 * DELETE /api/contact-tags    => delete an existing contact tag (by ID)
 */

export async function GET() {
    try {
        await connectDB();
        const tags = await ContactTag.find().sort({ createdAt: -1 });
        return NextResponse.json(tags, { status: 200 });
    } catch (error) {
        console.error("Error fetching contact tags:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const { name, color } = await request.json();
        if (!name) {
            return NextResponse.json({ error: "Missing name" }, { status: 400 });
        }
        const newTag = new ContactTag({ name, color });
        await newTag.save();

        return NextResponse.json(newTag, { status: 201 });
    } catch (error) {
        console.error("Error creating contact tag:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        await connectDB();
        const { id, updates } = await request.json();
        if (!id || !updates) {
            return NextResponse.json({ error: "Missing 'id' or 'updates'" }, { status: 400 });
        }

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const updatedTag = await ContactTag.findByIdAndUpdate(id, updates, {
            new: true,
        });

        if (!updatedTag) {
            return NextResponse.json({ error: "Tag not found" }, { status: 404 });
        }

        return NextResponse.json(updatedTag, { status: 200 });
    } catch (error) {
        console.error("Error updating contact tag:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "No tag ID provided" }, { status: 400 });
        }

        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid tag ID" }, { status: 400 });
        }

        await ContactTag.findByIdAndDelete(id);
        return NextResponse.json({ message: "Contact tag deleted" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting contact tag:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
