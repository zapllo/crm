import { NextRequest, NextResponse } from 'next/server';
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import { Organization } from "@/models/organizationModel";
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      credits
    } = await request.json();

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }

    // Add AI credits to organization
    const organization = await Organization.findByIdAndUpdate(
      user.organization,
      { $inc: { aiCredits: credits } },
      { new: true }
    );

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "AI credits payment verified and credits added successfully",
      creditedAmount: credits,
      totalAiCredits: organization.aiCredits,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    });

  } catch (error) {
    console.error('AI credits payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}