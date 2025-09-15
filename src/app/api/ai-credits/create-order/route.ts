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

    // Calculate GST (18%) and total amount that will be charged
    const gstAmount = Math.round(amount * 0.18);
    const totalAmountToCharge = amount + gstAmount;

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const receipt = `ai_credits_${Date.now()}`;
    const notes = {
      userId: userId.toString(),
      organizationId: user.organization?.toString() || '',
      credits: credits.toString(),
      purpose: 'ai_credits_purchase',
      baseAmount: amount.toString(),
      gstAmount: gstAmount.toString(),
      totalAmount: totalAmountToCharge.toString()
    };

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmountToCharge,
      currency: 'INR',
      receipt,
      notes,
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount, // This will be totalAmountToCharge * 100
      currency: razorpayOrder.currency,
      baseAmount: amount,
      gstAmount: gstAmount,
      totalAmount: totalAmountToCharge,
      credits: credits,
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