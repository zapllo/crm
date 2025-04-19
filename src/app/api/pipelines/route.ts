import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { createNotification } from "@/lib/notificationService";
import Pipeline from "@/models/pipelineModel";
import { User } from "@/models/userModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// POST handler

export async function POST(request: Request) {
    try {
        await connectDB();

        // Get userId from token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch the user
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        // Parse request body
        const body = await request.json();
        const { name, openStages, closeStages, customFields } = body;
        if (!name) {
            return NextResponse.json({ error: "Pipeline name is required" }, { status: 400 });
        }

        // Validate close stages for won/lost
        const formattedCloseStages = closeStages.map((stage: any) => ({
            ...stage,
            won: stage.won || false,
            lost: stage.lost || false,
        }));

        // Create new pipeline
        const pipeline = await Pipeline.create({
            name,
            organization: user.organization,
            openStages: openStages || [],
            closeStages: formattedCloseStages,
            customFields: customFields || [],
        });
        await createNotification({
          orgId: user.organization,
          recipientId: new mongoose.Types.ObjectId(userId), // Notify creator
          actorId: new mongoose.Types.ObjectId(userId),
          action: "create",
          entityType: "pipeline",
          entityId: pipeline._id,
          entityName: name,
          message: `New pipeline created: ${name}`,
          url: `/CRM/pipelines`,
        });

        return NextResponse.json(pipeline, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create pipeline" }, { status: 500 });
    }
}


// GET handler
export async function GET(request: Request) {
    try {
      await connectDB();

      // 1. Get userId from token
      const userId = getDataFromToken(request);
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // 2. Fetch user
      const user = await User.findById(userId);
      if (!user || !user.organization) {
        return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
      }

      // 3. Filter pipelines by user’s org
      const pipelines = await Pipeline.find({ organization: user.organization });

      return NextResponse.json(pipelines, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Failed to fetch pipelines" }, { status: 500 });
    }
  }

