import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Lead from '@/models/leadModel'
import Pipeline from '@/models/pipelineModel'

export async function GET(request: Request) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') || 'daily'

        // Fetch pipelines to identify won and lost stages
        const pipelines = await Pipeline.find({})

        // Extract stage names
        const wonStages = pipelines.flatMap(pipeline =>
            pipeline.closeStages.filter(stage => stage.won).map(stage => stage.name)
        )
        const lostStages = pipelines.flatMap(pipeline =>
            pipeline.closeStages.filter(stage => stage.lost).map(stage => stage.name)
        )

        let result

        switch (type) {
            case 'daily':
                result = await getDailyLeadsAnalytics(wonStages, lostStages)
                break
            // case 'monthly':
            //     result = await getMonthlyLeadsAnalytics(wonStages, lostStages)
            //     break
            // case 'source':
            //     result = await getSourceWiseLeadsAnalytics(wonStages, lostStages)
            //     break
            // case 'company':
            //     result = await getCompanyWiseLeadsAnalytics(wonStages, lostStages)
            //     break
            // case 'pipeline':
            //     result = await getPipelineWiseLeadsAnalytics(wonStages, lostStages)
            //     break
            // case 'salesPerson':
            //     result = await getSalesPersonWiseLeadsAnalytics(wonStages, lostStages)
            //     break
            // case 'stage':
            //     result = await getStageWiseLeadsAnalytics()
            //     break
            default:
                return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error('Leads API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch leads data' }, { status: 500 })
    }
}

async function getDailyLeadsAnalytics(wonStages, lostStages) {
    const days = 7
    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - (days - 1))
    startDate.setHours(0, 0, 0, 0)

    const leads = await Lead.find({
        createdAt: { $gte: startDate }
    }).populate('pipeline')

    // Process and return daily leads data
    // ...

    return [] // Placeholder
}

// Similar implementations for other analytics types
// ...