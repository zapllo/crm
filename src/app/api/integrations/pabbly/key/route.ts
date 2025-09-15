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
    
    // Check if user already has a Pabbly key
    const existingKey = await ApiKey.findOne({
      organization: user.organization,
      name: { $regex: /pabbly/i },
      isActive: true
    });
    
    // If there's an existing key, return it
    if (existingKey) {
      return NextResponse.json({ 
        apiKey: existingKey.key,
        message: "Using existing Pabbly API key" 
      });
    }
    
    // Generate a random API key specifically for Pabbly
    const apiKeyValue = `crm_pabbly_${crypto.randomBytes(16).toString('hex')}`;
    
    // Create API key with broad permissions for Pabbly
    const apiKey = new ApiKey({
      name: "Pabbly Connect Integration",
      key: apiKeyValue,
      permissions: ["read", "write"], // Pabbly needs read and write permissions
      organization: user.organization,
      isActive: true
    });
    
    // Save the API key to the database
    await apiKey.save();
    
    return NextResponse.json({ 
      apiKey: apiKeyValue,
      message: "Pabbly API key created successfully" 
    });
  } catch (error) {
    console.error('Error creating Pabbly API key:', error);
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Failed to create Pabbly API key: ${error instanceof Error ? error.message : 'Unknown error'}`
      : "Failed to create Pabbly API key";
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}