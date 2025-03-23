import connectDB from '@/lib/db'
import leadModel from '@/models/leadModel'
import pipelineModel from '@/models/pipelineModel'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily'

    // Fetch pipelines to identify won stages
    const pipelines = await pipelineModel.find({})

    // Extract all won stage names across all pipelines
    const wonStages = pipelines.flatMap(pipeline =>
      pipeline.closeStages.filter(stage => stage.won).map(stage => stage.name)
    )

    // Determine date range based on period
    let startDate, endDate, format, groupBy
    const now = new Date()

    switch (period) {
      case 'daily':
        // Last 7 days
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        format = '%d-%b-%Y'
        groupBy = { $dateToString: { format, date: '$createdAt' } }
        break
      case 'weekly':
        // Last 4 weeks
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 28)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        format = 'Week %V, %Y'
        groupBy = {
          $concat: [
            'Week ',
            { $toString: { $week: '$createdAt' } },
            ', ',
            { $toString: { $year: '$createdAt' } }
          ]
        }
        break
      case 'monthly':
        // Last 12 months
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 11)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        format = '%b %Y'
        groupBy = { $dateToString: { format, date: '$createdAt' } }
        break
      case 'yearly':
        // Last 5 years
        startDate = new Date(now)
        startDate.setFullYear(startDate.getFullYear() - 4)
        startDate.setMonth(0)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        format = '%Y'
        groupBy = { $dateToString: { format, date: '$createdAt' } }
        break
      default:
        return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }

    // MongoDB aggregation pipeline
    const salesData = await leadModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          stage: { $in: wonStages }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          won: '$count',
          amount: '$amount'
        }
      }
    ])

    // Fill in missing dates with zero values
    const result = fillMissingDates(salesData, startDate, endDate, period, format)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Sales API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 })
  }
}

// Helper function to fill in missing dates with zero values
function fillMissingDates(data, startDate, endDate, period, format) {
  // Implementation based on period
  // ...

  return data
}