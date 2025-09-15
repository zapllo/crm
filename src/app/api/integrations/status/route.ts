import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import Integration from '@/models/integrationModel';
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";

// This endpoint allows updating the status of an integration
export async function PATCH(request: NextRequest) {
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

    // Check if user is admin - modify this based on your user model
    // if (!user.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized - admin access required' }, { status: 401 });
    // }

    const { integrationId, status, notes } = await request.json();
    
    if (!integrationId || !status) {
      return NextResponse.json({ error: 'Integration ID and status are required' }, { status: 400 });
    }

    // Valid statuses
    const validStatuses = ['pending', 'in_progress', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    // Update the integration
    const updatedIntegration = await Integration.findByIdAndUpdate(
      integrationId,
      {
        setupStatus: status,
        ...(notes && { 'settings.adminNotes': notes })
      },
      { new: true }
    );

    if (!updatedIntegration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    return NextResponse.json(updatedIntegration);
  } catch (error) {
    console.error('Error updating integration status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// This endpoint allows fetching integration status
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
    
    const url = new URL(request.url);
    const platform = url.searchParams.get('platform');
    const id = url.searchParams.get('id');
    
    if (!platform && !id) {
      return NextResponse.json({ error: 'Platform or ID parameter is required' }, { status: 400 });
    }

    let query = {};
    
    if (id) {
      query = { _id: id };
    } else {
      // If not admin, only show integrations for user's organization
    //   if (!user.isAdmin) {
    //     query = { 
    //       platform, 
    //       organizationId: user.organization 
    //     };
    //   } else {
        query = { platform };
    //   }
    }

    const integrations = await Integration.find(query);
    
    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Error fetching integration status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}