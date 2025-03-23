import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Lead from '@/models/leadModel'
import Pipeline from '@/models/pipelineModel'
import { Types } from 'mongoose'

export async function GET(request: Request) {
    try {
        await connectDB()

        // Fetch pipelines to identify won stages
        const pipelines = await Pipeline.find({})

        // Extract all won stage names across all pipelines
        const wonStages = pipelines.flatMap(pipeline =>
            pipeline.closeStages.filter(stage => stage.won).map(stage => stage.name)
        )

        // Get aggregated data by sales person
        const salesPersonData = await Lead.aggregate([
            {
                $match: {
                    stage: { $in: wonStages },
                    assignedTo: { $exists: true }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignedTo',
                    foreignField: '_id',
                    as: 'salesPerson'
                }
            },
            {
                $unwind: '$salesPerson'
            },
            {
                $group: {
                    _id: '$assignedTo',
                    name: { $first: '$salesPerson.name' },
                    value: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    value: 1,
                    count: 1
                }
            },
            {
                $sort: { value: -1 }
            }
        ])

        return NextResponse.json(salesPersonData)
    } catch (error) {
        console.error('Sales Person API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch sales person data' }, { status: 500 })
    }
}