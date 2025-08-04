import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import Lead from '@/models/leadModel';
import Followup from '@/models/followupModel';
import Pipeline from '@/models/pipelineModel';
import Contact from '@/models/contactModel';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { User } from '@/models/userModel';

export async function GET(request: Request) {
  try {
    await connectDB();

    // Get user from token for authorization and org context
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || !user.organization) {
      return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
    }

    const orgId = user.organization;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const pipelineId = searchParams.get("pipelineId");
    const sourceId = searchParams.get("sourceId");
    const companyId = searchParams.get("companyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filter query
    let matchQuery: any = { organization: new mongoose.Types.ObjectId(orgId) };

    if (pipelineId) {
      matchQuery.pipeline = new mongoose.Types.ObjectId(pipelineId);
    }

    if (sourceId) {
      matchQuery.source = new mongoose.Types.ObjectId(sourceId);
    }

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (companyId) {
      // To filter by company, we need to join with contacts
      const contactsWithCompany = await Contact.find({
        company: new mongoose.Types.ObjectId(companyId)
      }).select('_id');

      const contactIds = contactsWithCompany.map(contact => contact._id);
      matchQuery.contact = { $in: contactIds };
    }

    // 1. Get pipeline stages for determining won/lost status
    const pipelines = await Pipeline.find({ organization: orgId });

    // Create maps of won and lost stages for each pipeline
    const wonStagesMap = new Map();
    const lostStagesMap = new Map();

    pipelines.forEach(pipeline => {
      const wonStages = pipeline.closeStages
        .filter((stage: any) => stage.won)
        .map((stage: any) => stage.name);

      const lostStages = pipeline.closeStages
        .filter((stage: any) => stage.lost)
        .map((stage: any) => stage.name);

      wonStagesMap.set(pipeline._id.toString(), wonStages);
      lostStagesMap.set(pipeline._id.toString(), lostStages);
    });

    // 2. Get lead summary statistics
    const leadsAggregate = await Lead.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'pipelines',
          localField: 'pipeline',
          foreignField: '_id',
          as: 'pipelineData'
        }
      },
      { $unwind: '$pipelineData' },
      {
        $project: {
          _id: 1,
          title: 1,
          amount: 1,
          stage: 1,
          source: 1,
          pipeline: 1,
          contact: 1,
          createdAt: 1,
          closeStages: '$pipelineData.closeStages'
        }
      },
      // Replace the $addFields section with this corrected version
      {
        $addFields: {
          isWon: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$closeStages",
                        as: "closeStage",
                        cond: {
                          $and: [
                            { $eq: ["$$closeStage.name", "$stage"] },
                            { $eq: ["$$closeStage.won", true] }
                          ]
                        }
                      }
                    }
                  },
                  0
                ]
              },
              then: true,
              else: false
            }
          },
          isLost: {
            $cond: {
              if: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: "$closeStages",
                        as: "closeStage",
                        cond: {
                          $and: [
                            { $eq: ["$$closeStage.name", "$stage"] },
                            { $eq: ["$$closeStage.lost", true] }
                          ]
                        }
                      }
                    }
                  },
                  0
                ]
              },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          openCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$isWon', true] }, { $ne: ['$isLost', true] }] },
                1,
                0
              ]
            }
          },
          openAmount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$isWon', true] }, { $ne: ['$isLost', true] }] },
                '$amount',
                0
              ]
            }
          },
          wonCount: { $sum: { $cond: ['$isWon', 1, 0] } },
          wonAmount: { $sum: { $cond: ['$isWon', '$amount', 0] } },
          lostCount: { $sum: { $cond: ['$isLost', 1, 0] } },
          lostAmount: { $sum: { $cond: ['$isLost', '$amount', 0] } }
        }
      }
    ]);

    // 3. Get time period based reports (daily, weekly, monthly, yearly)
    // ... existing code ...

    // 3. Get time period based reports (daily, weekly, monthly, yearly)
    const timeBasedLeads = await Lead.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'pipelines',
          localField: 'pipeline',
          foreignField: '_id',
          as: 'pipelineData'
        }
      },
      { $unwind: '$pipelineData' },
      {
        $addFields: {
          dayOfYear: { $dayOfYear: '$createdAt' },
          week: { $week: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          isWon: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.won', true] }
                }
              }
            ]
          },
          isLost: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.lost', true] }
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            week: {
              year: { $year: "$createdAt" },
              week: { $week: "$createdAt" }
            },
            month: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            year: { $year: "$createdAt" }
          },
          date: { $first: "$createdAt" },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
          wonCount: { $sum: { $cond: ["$isWon", 1, 0] } },
          wonAmount: { $sum: { $cond: ["$isWon", "$amount", 0] } },
          lostCount: { $sum: { $cond: ["$isLost", 1, 0] } },
          lostAmount: { $sum: { $cond: ["$isLost", "$amount", 0] } }
        }
      },
      {
        $sort: { "date": 1 }
      },
      {
        $group: {
          _id: null,
          daily: {
            $push: {
              date: "$_id.day",
              actualDate: "$date",
              count: "$count",
              amount: "$amount",
              wonCount: "$wonCount",
              wonAmount: "$wonAmount",
              lostCount: "$lostCount",
              lostAmount: "$lostAmount"
            }
          },
          weekly: {
            $push: {
              date: {
                $concat: [
                  { $toString: "$_id.week.year" },
                  "-W",
                  { $toString: "$_id.week.week" }
                ]
              },
              actualDate: "$date",
              count: "$count",
              amount: "$amount",
              wonCount: "$wonCount",
              wonAmount: "$wonAmount",
              lostCount: "$lostCount",
              lostAmount: "$lostAmount"
            }
          },
          monthly: {
            $push: {
              date: {
                $concat: [
                  { $toString: "$_id.month.year" },
                  "-",
                  { $toString: "$_id.month.month" }
                ]
              },
              actualDate: "$date",
              count: "$count",
              amount: "$amount",
              wonCount: "$wonCount",
              wonAmount: "$wonAmount",
              lostCount: "$lostCount",
              lostAmount: "$lostAmount"
            }
          },
          yearly: {
            $push: {
              date: { $toString: "$_id.year" },
              actualDate: "$date",
              count: "$count",
              amount: "$amount",
              wonCount: "$wonCount",
              wonAmount: "$wonAmount",
              lostCount: "$lostCount",
              lostAmount: "$lostAmount"
            }
          }
        }
      }
    ]);

    // Consolidate reports by time period to handle duplicate keys
    const consolidateTimePeriods = (items: any[]) => {
      const consolidatedMap = new Map<string, any>();

      items.forEach(item => {
        if (!consolidatedMap.has(item.date)) {
          consolidatedMap.set(item.date, {
            date: item.date,
            actualDate: item.actualDate,
            count: 0,
            amount: 0,
            wonCount: 0,
            wonAmount: 0,
            lostCount: 0,
            lostAmount: 0
          });
        }

        const existing = consolidatedMap.get(item.date);
        existing.count += item.count;
        existing.amount += item.amount;
        existing.wonCount += item.wonCount;
        existing.wonAmount += item.wonAmount;
        existing.lostCount += item.lostCount;
        existing.lostAmount += item.lostAmount;
      });

      return Array.from(consolidatedMap.values())
        .sort((a, b) => new Date(a.actualDate).getTime() - new Date(b.actualDate).getTime());
    };

    // Prepare time-based reports
    const timeBasedReports = timeBasedLeads.length > 0 ? {
      daily: consolidateTimePeriods(timeBasedLeads[0].daily),
      weekly: consolidateTimePeriods(timeBasedLeads[0].weekly),
      monthly: consolidateTimePeriods(timeBasedLeads[0].monthly),
      yearly: consolidateTimePeriods(timeBasedLeads[0].yearly)
    } : {
      daily: [],
      weekly: [],
      monthly: [],
      yearly: []
    };


    // 4. Get source-wise reports
    const sourceWiseLeads = await Lead.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'pipelines',
          localField: 'pipeline',
          foreignField: '_id',
          as: 'pipelineData'
        }
      },
      { $unwind: '$pipelineData' },
      {
        $lookup: {
          from: 'sources',
          localField: 'source',
          foreignField: '_id',
          as: 'sourceData'
        }
      },
      { $unwind: '$sourceData' },
      {
        $addFields: {
          isWon: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.won', true] }
                }
              }
            ]
          },
          isLost: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.lost', true] }
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$source',
          sourceName: { $first: '$sourceData.name' },
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          wonCount: { $sum: { $cond: ['$isWon', 1, 0] } },
          wonAmount: { $sum: { $cond: ['$isWon', '$amount', 0] } },
          lostCount: { $sum: { $cond: ['$isLost', 1, 0] } },
          lostAmount: { $sum: { $cond: ['$isLost', '$amount', 0] } },
          openCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$isWon', true] }, { $ne: ['$isLost', true] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // 5. Get pipeline-wise reports
    const pipelineWiseLeads = await Lead.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'pipelines',
          localField: 'pipeline',
          foreignField: '_id',
          as: 'pipelineData'
        }
      },
      { $unwind: '$pipelineData' },
      {
        $addFields: {
          isWon: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.won', true] }
                }
              }
            ]
          },
          isLost: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.lost', true] }
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$pipeline',
          pipelineName: { $first: '$pipelineData.name' },
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          wonCount: { $sum: { $cond: ['$isWon', 1, 0] } },
          wonAmount: { $sum: { $cond: ['$isWon', '$amount', 0] } },
          lostCount: { $sum: { $cond: ['$isLost', 1, 0] } },
          lostAmount: { $sum: { $cond: ['$isLost', '$amount', 0] } },
          openCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$isWon', true] }, { $ne: ['$isLost', true] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // 6. Get stage-wise reports
    const stageWiseLeads = await Lead.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'pipelines',
          localField: 'pipeline',
          foreignField: '_id',
          as: 'pipelineData'
        }
      },
      { $unwind: '$pipelineData' },
      {
        $addFields: {
          isWon: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.won', true] }
                }
              }
            ]
          },
          isLost: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.lost', true] }
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$stage',
          stageName: { $first: '$stage' },
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          pipelineName: { $first: '$pipelineData.name' }
        }
      }
    ]);

    // 7. Get company-wise reports
    const companyWiseLeads = await Lead.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'contacts',
          localField: 'contact',
          foreignField: '_id',
          as: 'contactData'
        }
      },
      { $unwind: '$contactData' },
      {
        $lookup: {
          from: 'companies',
          localField: 'contactData.company',
          foreignField: '_id',
          as: 'companyData'
        }
      },
      { $unwind: '$companyData' },
      {
        $lookup: {
          from: 'pipelines',
          localField: 'pipeline',
          foreignField: '_id',
          as: 'pipelineData'
        }
      },
      { $unwind: '$pipelineData' },
      {
        $addFields: {
          isWon: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.won', true] }
                }
              }
            ]
          },
          isLost: {
            $in: [
              '$stage',
              {
                $filter: {
                  input: '$pipelineData.closeStages',
                  as: 'closeStage',
                  cond: { $eq: ['$$closeStage.lost', true] }
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$contactData.company',
          companyName: { $first: '$companyData.companyName' },
          totalCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          wonCount: { $sum: { $cond: ['$isWon', 1, 0] } },
          wonAmount: { $sum: { $cond: ['$isWon', '$amount', 0] } },
          lostCount: { $sum: { $cond: ['$isLost', 1, 0] } },
          lostAmount: { $sum: { $cond: ['$isLost', '$amount', 0] } },
          openCount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$isWon', true] }, { $ne: ['$isLost', true] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // 8. Get follow-up statistics
    const followupStats = await Followup.aggregate([
      {
        $match: {
          ...matchQuery,
          followupDate: matchQuery.createdAt // Apply the same date filter
        }
      },
      {
        $group: {
          _id: "$stage",
          count: { $sum: 1 },
          byType: {
            $push: {
              type: "$type",
              id: "$_id"
            }
          }
        }
      },
      {
        $project: {
          stage: "$_id",
          count: 1,
          openCount: {
            $size: {
              $filter: {
                input: "$byType",
                as: "item",
                cond: { $eq: ["$$item.stage", "Open"] }
              }
            }
          },
          closedCount: {
            $size: {
              $filter: {
                input: "$byType",
                as: "item",
                cond: { $eq: ["$$item.stage", "Closed"] }
              }
            }
          },
          callCount: {
            $size: {
              $filter: {
                input: "$byType",
                as: "item",
                cond: { $eq: ["$$item.type", "Call"] }
              }
            }
          },
          emailCount: {
            $size: {
              $filter: {
                input: "$byType",
                as: "item",
                cond: { $eq: ["$$item.type", "Email"] }
              }
            }
          },
          whatsappCount: {
            $size: {
              $filter: {
                input: "$byType",
                as: "item",
                cond: { $eq: ["$$item.type", "WhatsApp"] }
              }
            }
          }
        }
      }
    ]);

    // 9. Calculate conversion rates
    interface ConversionRate {
      _id: any;
      name: string;
      conversionRate: number;
    }

    const conversionRates: {
      overall: number;
      bySource: ConversionRate[];
      byPipeline: ConversionRate[];
    } = {
      overall: 0,
      bySource: [],
      byPipeline: [],
    };

    // Overall conversion rate
    if (leadsAggregate.length > 0 && leadsAggregate[0].totalCount > 0) {
      conversionRates.overall = (leadsAggregate[0].wonCount / leadsAggregate[0].totalCount) * 100;
    }

    // By source conversion rates
    conversionRates.bySource = sourceWiseLeads.map(source => ({
      _id: source._id,
      name: source.sourceName,
      conversionRate: source.totalCount > 0 ? (source.wonCount / source.totalCount) * 100 : 0
    })) as ConversionRate[];

    // By pipeline conversion rates
    conversionRates.byPipeline = pipelineWiseLeads.map(pipeline => ({
      _id: pipeline._id,
      name: pipeline.pipelineName,
      conversionRate: pipeline.totalCount > 0 ? (pipeline.wonCount / pipeline.totalCount) * 100 : 0
    })) as ConversionRate[];

    // Prepare response data
    const dashboardData = {
      summary: leadsAggregate.length > 0 ? leadsAggregate[0] : {
        totalCount: 0,
        totalAmount: 0,
        openCount: 0,
        openAmount: 0,
        wonCount: 0,
        wonAmount: 0,
        lostCount: 0,
        lostAmount: 0
      },
      timeBasedReports: timeBasedReports,
      sourceWiseReports: sourceWiseLeads,
      pipelineWiseReports: pipelineWiseLeads,
      stageWiseReports: stageWiseLeads,
      companyWiseReports: companyWiseLeads,
      followupStats,
      conversionRates
    };

    return NextResponse.json(dashboardData, { status: 200 });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
