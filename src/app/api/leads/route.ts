import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import Lead from '@/models/leadModel';
import Pipeline from '@/models/pipelineModel';
import { User } from '@/models/userModel';
import { NextResponse } from 'next/server';



export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pipelineId = searchParams.get("pipelineId");
        const stage = searchParams.get("stage");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        await connectDB();

        let query: any = { pipeline: pipelineId };
        if (stage) query.stage = stage;

        // ✅ Apply the `createdAt` filter properly
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        console.log("Generated Query:", JSON.stringify(query, null, 2));

        // ✅ Use `query` instead of hardcoded `{ pipeline, stage }`
        const leads = await Lead.find(query)
            .populate("contact")
            .populate({
                path: "assignedTo",
                select: "firstName lastName",
            })
            .exec();

        console.log("Leads Fetched:", leads.length);
        return new Response(JSON.stringify(leads), { status: 200 });
    } catch (error) {
        console.error("Error fetching leads:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch leads" }), { status: 500 });
    }
}


// POST handler for creating a lead
export async function POST(request: Request) {
    try {
        await connectDB();

        const { pipeline, stage, title, description, product, contact, assignedTo, estimateAmount, closeDate } = await request.json();

        // // Generate a unique leadId
        // const totalLeads = await Lead.countDocuments();
        // const leadId = `L-${totalLeads + 1}`;

        // 1. Get userId from token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. We assume user.organization is the ObjectId or a reference to the org
        if (!user.organization) {
            return NextResponse.json({ error: "User has no associated organization" }, { status: 400 });
        }

        // 1) Find the pipeline to get its organization
        const pipelineDoc = await Pipeline.findById(pipeline);
        if (!pipelineDoc) {
            return NextResponse.json(
                { error: "Invalid pipeline" },
                { status: 400 }
            );
        }

        // 2) Grab the org from pipeline
        const orgId = pipelineDoc.organization;
        if (!orgId) {
            return NextResponse.json(
                { error: "Pipeline has no organization reference" },
                { status: 400 }
            );
        }

        // 3) Count how many leads this org already has
        const totalLeadsInOrg = await Lead.countDocuments({ organization: orgId });

        // 4) Generate a unique leadId, org-specific
        const leadId = `L-${totalLeadsInOrg + 1}`;

        const newLead = new Lead({
            leadId,
            pipeline,
            stage,
            title,
            description,
            product,  // Store product ID
            contact,  // Store contact ID
            assignedTo,
            amount: estimateAmount,
            organization: user.organization,
            closeDate,
        });

        const savedLead = await newLead.save();

        return NextResponse.json(savedLead, { status: 201 });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
