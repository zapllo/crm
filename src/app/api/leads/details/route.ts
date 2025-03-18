import connectDB from '@/lib/db';
import Lead from '@/models/leadModel';
import Pipeline from '@/models/pipelineModel';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    try {
        await connectDB();

        // Fetch lead details with related data populated
        const lead = await Lead.findById(leadId)
            .populate('pipeline')
            .populate({
                path: 'contact',
                populate: {
                    path: 'company', // Fetch company details related to contact
                    select: 'companyName country state city shippingAddress pincode', // Only necessary fields
                },
            })
            .populate('assignedTo', 'firstName lastName email whatsappNumber')
            .populate('product', 'productName')
            .exec();

        if (!lead) {
            return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404 });
        }

        // Fetch pipeline details
        const pipeline = await Pipeline.findById(lead.pipeline).exec();
        if (!pipeline) {
            return new Response(JSON.stringify({ error: 'Pipeline not found' }), { status: 404 });
        }

        return new Response(
            JSON.stringify({
                leadId: lead.leadId,
                title: lead.title,
                pipeline: {
                    id: pipeline._id,
                    name: pipeline.name,
                    openStages: pipeline.openStages,
                    closeStages: pipeline.closeStages,
                },
                stage: lead.stage,
                assignedTo: lead.assignedTo
                    ? {
                        id: lead.assignedTo._id,
                        name: `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`,
                        email: lead.assignedTo.email,
                    }
                    : null,
                source: lead.source,
                closingDate: lead.closeDate,
                amount: lead.amount,
                description: lead.description,
                product: lead.product ? { id: lead.product._id, name: lead.product.productName } : null,
                contact: lead.contact
                    ? {
                        id: lead.contact._id,
                        name: `${lead.contact.firstName} ${lead.contact.lastName}`,
                        email: lead.contact.email || 'N/A',
                        phone: lead.contact.whatsappNumber || 'N/A',
                        company: lead.contact.company
                            ? {
                                id: lead.contact.company._id,
                                name: lead.contact.company.companyName,
                                country: lead.contact.company.country,
                                state: lead.contact.company.state,
                                city: lead.contact.company.city,
                                address: lead.contact.company.shippingAddress,
                                pincode: lead.contact.company.pincode,
                            }
                            : null,
                    }
                    : null,
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt,
                timeline: lead.timeline.reverse(), // ✅ Latest first
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching lead details:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch lead details' }), { status: 500 });
    }
}
