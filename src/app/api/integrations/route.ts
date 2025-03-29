import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import Integration from '@/models/integrationModel';
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";

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

    // Find all integrations for this organization
    const integrations = await Integration.find({ organizationId: user.organization });
    
    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    
    const { platform, apiKey, pipelineId, settings } = await request.json();
    
    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    // Check if integration already exists
    const existingIntegration = await Integration.findOne({
      organizationId: user.organization,
      platform
    });

    if (existingIntegration) {
      // Update existing integration
      const updatedIntegration = await Integration.findByIdAndUpdate(
        existingIntegration._id,
        {
          apiKey,
          pipelineId,
          settings,
          userId // Update with current user
        },
        { new: true }
      );
      
      return NextResponse.json(updatedIntegration);
    }

    // Create new integration
    const newIntegration = new Integration({
      userId,
      organizationId: user.organization,
      platform,
      apiKey,
      pipelineId,
      isPurchased: false, // Default to false for newly created integrations
      settings
    });

    await newIntegration.save();
    
    return NextResponse.json(newIntegration, { status: 201 });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}