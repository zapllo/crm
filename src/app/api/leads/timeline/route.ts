import Lead from '@/models/leadModel';
import FollowUp from '@/models/followupModel';
import QuotationModel from '@/models/quotationModel';
import connectDB from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    try {
        await connectDB();

        // Fetch the lead's timeline with `movedBy` populated
        const lead = await Lead.findById(leadId)
            .select('timeline')
            .populate({
                path: 'timeline.movedBy',
                model: 'User',
                select: 'firstName lastName',
            })
            .exec();

        if (!lead) {
            return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404 });
        }

        // Fetch follow-ups for the lead (using `createdAt` as timestamp)
        const followups = await FollowUp.find({ lead: leadId })
            .select('description type createdAt')
            .populate({
                path: 'addedBy',
                model: 'User',
                select: 'firstName lastName',
            }).exec();

        // Fetch quotations for the lead
        const quotations = await QuotationModel.find({ lead: leadId })
            .select('quotationNumber title status total currency createdAt updatedAt')
            .populate({
                path: 'creator',
                model: 'User',
                select: 'firstName lastName',
            }).exec();

        // Format timeline entries with `movedBy`
        const timelineEntries = lead.timeline.map((entry: any) => ({
            stage: entry.stage,
            action: entry.action,
            remark: entry.remark,
            timestamp: new Date(entry.timestamp).toISOString(),
            type: 'stage',
            movedBy: entry.movedBy
                ? `${entry.movedBy.firstName} ${entry.movedBy.lastName}`
                : 'Unknown User',
        }));

        // Format follow-up entries using `createdAt` as timestamp
        const followupEntries = followups.map((followup: any) => ({
            stage: 'Follow-Up',
            action: `Follow-Up Type: ${followup.type}`,
            remark: followup.description,
            timestamp: new Date(followup.createdAt).toISOString(),
            type: 'followup',
            followupType: followup.type,
            addedBy: followup.addedBy
                ? `${followup.addedBy.firstName} ${followup.addedBy.lastName}`
                : 'Unknown User',
        }));

        // Format quotation entries
        const quotationEntries = quotations.map((quotation: any) => ({
            stage: 'Quotation',
            action: `Quotation ${quotation.status === 'sent' ? 'sent' : 'created'}: ${quotation.quotationNumber}`,
            remark: `${quotation.title} - ${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: quotation.currency || 'USD',
            }).format(quotation.total || 0)}`,
            timestamp: new Date(quotation.createdAt).toISOString(),
            type: 'quotation',
            quotationStatus: quotation.status,
            quotationId: quotation._id,
            addedBy: quotation.creator
                ? `${quotation.creator.firstName} ${quotation.creator.lastName}`
                : 'Unknown User',
        }));

        // Combine and sort by timestamp (Latest First)
        const combinedTimeline = [...timelineEntries, ...followupEntries, ...quotationEntries].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return new Response(JSON.stringify(combinedTimeline), { status: 200 });
    } catch (error) {
        console.error('Error fetching timeline:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch timeline' }), { status: 500 });
    }
}