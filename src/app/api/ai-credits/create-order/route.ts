import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { credits, amount } = await request.json();

    if (!credits || !amount || credits < 10) {
      return NextResponse.json({ error: "Invalid credits or amount" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const receipt = `ai_credits_${Date.now()}`;
    const notes = {
      userId: userId.toString(),
      organizationId: user.organization?.toString() || '',
      credits: credits.toString(),
      purpose: 'ai_credits_purchase'
    };

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes,
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      user: {
        name: user.firstName + ' ' + (user.lastName || ''),
        email: user.email,
        contact: user.whatsappNo || user.contact || ''
      }
    });

  } catch (error) {
    console.error('Error creating AI credits order:', error);
    return NextResponse.json({ error: 'Error creating AI credits order' }, { status: 500 });
  }
}