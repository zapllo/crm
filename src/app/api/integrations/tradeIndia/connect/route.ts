import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import TradeIndiaIntegration from "@/models/tradeIndiaIntegrationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tradeIndiaUserId, tradeIndiaProfileId, tradeIndiaKey, pipelineId } = body;

    // Upsert the TradeIndiaIntegration doc
    const updated = await TradeIndiaIntegration.findOneAndUpdate(
      { userId },
      {
        $set: {
          tradeIndiaUserId,
          tradeIndiaProfileId,
          tradeIndiaKey,
          pipelineId: pipelineId || null,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "TradeIndia settings updated",
      record: updated,
    });
  } catch (error) {
    console.error("Error updating TradeIndia settings:", error);
    return NextResponse.json({ error: "Failed to update TradeIndia settings" }, { status: 500 });
  }
}
