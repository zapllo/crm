// app/api/sources/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/categoryModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import { createNotification } from "@/lib/notificationService";
import mongoose from "mongoose";
// import { getUserOrganization } from "@/lib/auth"; // or however you get the org from the user

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        // 1. Get userId from token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.organization) {
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        const categories = await Category.find({ organization: user.organization }).sort({ name: 1 });
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error("Error fetching sources:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Missing name " }, { status: 400 });
        }

        // Optionally verify user has permission for orgId etc.

        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }


        const newCategory = await Category.create({
            name,
            organization: user.organization,
        });

        await createNotification({
            orgId: user.organization,
            recipientId: new mongoose.Types.ObjectId(userId), // Notify creator
            actorId: new mongoose.Types.ObjectId(userId),
            action: "create",
            entityType: "category",
            entityId: newCategory._id,
            entityName: name,
            message: `New category created: ${name}`,
            url: `/CRM/categories`,
          });

        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.error("Error creating source:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
