import { NextResponse } from 'next/server';
import Lead from '@/models/leadModel';
import Pipeline from '@/models/pipelineModel';
// import { connectDB } from '@/lib/db';
import { getDateRange } from '@/lib/utils';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { dateRange, source, pipeline } = await req.json();

    const { startDate, endDate } = getDateRange(dateRange);

    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      ...(source && { source: new mongoose.Types.ObjectId(source) }),
      ...(pipeline && { pipeline: new mongoose.Types.ObjectId(pipeline) })
    };

    const [leads, pipelines] = await Promise.all([
      Lead.aggregate([
        { $match: matchStage },
        {
          $facet: {
            totalLeads: [{ $count: "count" }],
            convertedLeads: [
              { $match: { stage: "Won" } },
              { $count: "count" }
            ],
            leadSourceStats: [
              { $group: { _id: "$source", count: { $sum: 1 } } }
            ],
            leadStageStats: [
              { $group: { _id: "$stage", count: { $sum: 1 } } }
            ],
            leadValueStats: [
              { $group: { _id: null, totalValue: { $sum: "$amount" } } }
            ],
            dailyLeads: [
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ]),
      Pipeline.aggregate([
        {
          $facet: {
            pipelineStats: [
              { $unwind: "$openStages" },
              { $group: { _id: "$openStages.name", count: { $sum: 1 } } }
            ]
          }
        }
      ])
    ]);

    const conversionRate = 
      ((leads[0].convertedLeads[0]?.count || 0) / 
      (leads[0].totalLeads[0]?.count || 1)) * 100;

    const data = {
      totalLeads: leads[0].totalLeads[0]?.count || 0,
      convertedLeads: leads[0].convertedLeads[0]?.count || 0,
      conversionRate: conversionRate.toFixed(2),
      leadSourceStats: leads[0].leadSourceStats,
      leadStageStats: leads[0].leadStageStats,
      totalValue: leads[0].leadValueStats[0]?.totalValue || 0,
      dailyLeads: leads[0].dailyLeads,
      pipelineStats: pipelines[0].pipelineStats
    };

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sales data" },
      { status: 500 }
    );
  }
}
