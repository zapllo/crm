import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from "@/lib/getDataFromToken";
import Webhook from '@/models/webhookModel';
import { User } from "@/models/userModel";
import crypto from 'crypto';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Extract user ID from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user and get their organization
    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }
    
    const webhooks = await Webhook.find({ organization: user.organization });
    
    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json(
      { error: "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Extract user ID from token
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user and get their organization
    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }
    
    const body = await request.json();
    const { name, url, events, status } = body;
    
    // Validate required fields
    if (!name || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Generate a random webhook secret
    const secret = crypto.randomBytes(32).toString('hex');
    
    // Create webhook
    const webhook = await Webhook.create({
      name,
      url,
      events,
      status: status || 'active',
      secret,
      organization: user.organization,
    });
    
    return NextResponse.json({ webhook }, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}