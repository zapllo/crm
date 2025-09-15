import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import Integration from '@/models/integrationModel';
import Order from '@/models/orderModel';
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import mongoose from 'mongoose';

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
    
    const { 
      platform, 
      orderId, 
      paymentId, 
      razorpay_signature, 
      amount
    } = await request.json();
    
    if (!platform || !orderId || !paymentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create order record
    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      orderId,
      paymentId,
      amount,
      planName: `${platform} Integration`,
      subscribedUserCount: 0, // Not applicable for integrations
      additionalUserCount: 0, // Not applicable for integrations
    });

    await newOrder.save();

    // Check if integration already exists
    let integration = await Integration.findOne({
      organizationId: user.organization,
      platform
    });

    if (integration) {
      // Update existing integration
      integration = await Integration.findByIdAndUpdate(
        integration._id,
        {
          isPurchased: true,
          purchaseDate: new Date(),
          orderId,
          paymentId,
          amount,
          setupStatus: 'pending'
        },
        { new: true }
      );
    } else {
      // Create new integration record
      integration = new Integration({
        userId,
        organizationId: user.organization,
        platform,
        isPurchased: true,
        purchaseDate: new Date(),
        orderId,
        paymentId,
        amount,
        setupStatus: 'pending'
      });

      await integration.save();
    }
    
    // Send notification to integration team (this would be implemented based on your notification system)
    try {
      // Example: Send email notification
      // await sendEmail({
      //   to: "integrations@zapllo.com",
      //   subject: `New Integration Purchase: ${platform}`,
      //   text: `A new ${platform} integration has been purchased by organization ${user.organization}.`
      // });
      
      console.log(`Integration purchase notification sent for ${platform}`);
    } catch (notificationError) {
      console.error('Error sending integration purchase notification:', notificationError);
      // Don't fail the request if notification fails
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Integration purchase successful',
      integration
    });
  } catch (error) {
    console.error('Error processing integration purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}