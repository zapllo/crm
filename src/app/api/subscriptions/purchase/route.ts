// CRM app: /app/api/subscriptions/purchase/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organization from "@/models/organizationModel"; // your CRM-side model

export async function POST(request: NextRequest) {
  try {
    // 1. Parse JSON body from the Billing app
    const {
      organizationId,
      planName,
      subscribedUserCount,
      subscriptionExpires,
      // any other fields you passed
    } = await request.json();

    await connectDB(); // ensure DB is connected

    // 2. Find the Organization by ID (CRM’s copy)
    const org = await Organization.findById(organizationId);
    if (!org) {
      return NextResponse.json({ error: "Organization not found in CRM" }, { status: 404 });
    }

    // 3. Update local fields
    org.isPro = true;
    org.subscribedPlan = planName;
    org.subscribedUserCount = subscribedUserCount;
    org.subscriptionExpires = new Date(subscriptionExpires);

    // If you want to set isTrialExpired = false or something else:
    // org.isTrialExpired = false;

    // 4. Save to DB
    await org.save();

    // 5. Return success
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating CRM subscription:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
