import { NextRequest, NextResponse } from 'next/server';
import { User } from "@/models/userModel";
import Pipeline from '@/models/pipelineModel';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get the API key from the request headers
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 401 }
      );
    }

    // Verify the API key and get organization
    const ApiKey = require('@/models/apiKeyModel').default;
    const validKey = await ApiKey.findOne({ key: apiKey, isActive: true });

    if (!validKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const organizationId = validKey.organization;

    // Get all pipelines for the organization
    const pipelines = await Pipeline.find({ 
      organization: organizationId 
    }).select('name openStages closeStages');

    return NextResponse.json({
      success: true,
      pipelines: pipelines.map(pipeline => ({
        id: pipeline._id,
        name: pipeline.name,
        openStages: pipeline.openStages,
        closeStages: pipeline.closeStages
      }))
    });
  } catch (error: any) {
    console.error('Error fetching pipelines for Zaptick:', error);
    return NextResponse.json(
      { error: "Failed to fetch pipelines", details: error.message },
      { status: 500 }
    );
  }
}