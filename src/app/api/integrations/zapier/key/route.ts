import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from "@/lib/getDataFromToken";
import ApiKey from '@/models/apiKeyModel';
import { User } from "@/models/userModel";
import crypto from 'crypto';
import connectDB from '@/lib/db';

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
    
    // Check if user already has a Zapier key
    const existingKey = await ApiKey.findOne({
      organization: user.organization,
      name: { $regex: /zapier/i },
      isActive: true
    });
    
    // If there's an existing key, return it
    if (existingKey) {
      return NextResponse.json({ 
        apiKey: existingKey.key,
        message: "Using existing Zapier API key" 
      });
    }
    
    // Generate a random API key specifically for Zapier
    const apiKeyValue = `crm_zapier_${crypto.randomBytes(16).toString('hex')}`;
    
    // Create API key with broad permissions for Zapier
    const apiKey = new ApiKey({
      name: "Zapier Integration",
      key: apiKeyValue,
      permissions: ["read", "write"], // Zapier needs read and write permissions
      organization: user.organization,
      isActive: true
    });
    
    // Save the API key to the database
    await apiKey.save();
    
    return NextResponse.json({ 
      apiKey: apiKeyValue,
      message: "Zapier API key created successfully" 
    });
  } catch (error) {
    console.error('Error creating Zapier API key:', error);
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to create Zapier API key: ${error instanceof Error ? error.message : 'Unknown error'}`
      : "Failed to create Zapier API key";
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}