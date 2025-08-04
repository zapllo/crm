import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from "@/lib/getDataFromToken";
import ApiKey from '@/models/apiKeyModel';
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
    
    const apiKeys = await ApiKey.find({ 
      organization: user.organization,
      isActive: true
    });
    
    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
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
    const { name, permissions } = body;
    
    // Validate required fields
    if (!name || !permissions || permissions.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Generate a random API key
    const plainTextKey = `crm_${crypto.randomBytes(32).toString('hex')}`;
    
    // Create API key
    const apiKey = await ApiKey.create({
      name,
      key: plainTextKey, // In a real app, you might want to hash this
      permissions,
      organization: user.organization,
      isActive: true
    });
    
    return NextResponse.json({ 
      apiKey,
      plainTextKey
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}