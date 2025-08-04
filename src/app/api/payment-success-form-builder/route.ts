import { NextResponse } from 'next/server';

import crypto from 'crypto';
import Organization from '@/models/organizationModel';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

export async function POST(req: Request) {
  try {
    await connectDB();
  const userId = getDataFromToken(req);
    const user = await User.findById(userId).select('organization');
    if (!user) {
      return NextResponse.json({  message: "User not found" }, { status: 404 });
    }
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      planName,
      formBuilderPlan
    } = await req.json();

    // Verify the payment signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 });
    }

    // Update organization with form builder subscription
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const updateFields = {
      // Add formBuilder to activeSubscriptions
      $addToSet: { activeSubscriptions: 'formBuilder' },

      // Update formBuilder configuration
      formBuilder: {
        enabled: true,
        plan: formBuilderPlan.plan,
        maxForms: formBuilderPlan.maxForms,
        maxSubmissionsPerMonth: formBuilderPlan.maxSubmissions,
        submissionsCount: {
          currentMonth: 0,
          lastResetDate: new Date()
        }
      },

      // Set subscription expiry date
      subscriptionExpires: oneYearFromNow
    };

    await Organization.findByIdAndUpdate(
     user.organization,
     updateFields,
      { new: true }
    );

    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
