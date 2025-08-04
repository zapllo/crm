import { NextResponse } from 'next/server';
import { getDataFromToken } from "@/lib/getDataFromToken";
import ApiKey from '@/models/apiKeyModel';
import { User } from "@/models/userModel";
import connectDB from '@/lib/db';
import { NextRequest } from 'next/server';

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
    
    // Check if user already has a Zapier key
    const existingKey = await ApiKey.findOne({
      organization: user.organization,
      name: { $regex: /zapier/i },
      isActive: true
    });
    
    return NextResponse.json({ 
      connected: !!existingKey
    });
  } catch (error) {
    console.error('Error checking Zapier integration:', error);
    return NextResponse.json(
      { error: "Failed to check Zapier integration status" },
      { status: 500 }
    );
  }
}