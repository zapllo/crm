import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import Lead from '@/models/leadModel';
import Pipeline from '@/models/pipelineModel';
import { User } from '@/models/userModel';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Basic parameters
        const pipelineId = searchParams.get("pipelineId");
        const stage = searchParams.get("stage");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        // Filter parameters - log them to see what's being received
        const assignedTo = searchParams.get("assignedTo");
        const stages = searchParams.get("stages");
        const tags = searchParams.get("tags");
        const companies = searchParams.get("companies");

        console.log("Received filter params:", {
            assignedTo,
            stages,
            tags,
            companies
        });

        await connectDB();

        // Build query object
        let query: any = {};

        // Always add pipeline filter if provided
        if (pipelineId) {
            query.pipeline = pipelineId;
        }

        // Add stage filter if provided (single stage)
        if (stage) {
            query.stage = stage;
        }

        // Add date range if provided
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        // Handle filters - Parse JSON for array filters
        if (assignedTo) {
            try {
                const assignedToArray = JSON.parse(assignedTo);
                if (Array.isArray(assignedToArray) && assignedToArray.length > 0) {
                    // Convert strings to ObjectIds if needed
                    query.assignedTo = {
                        $in: assignedToArray.map(id =>
                            mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
                        )
                    };
                }
            } catch (e) {
                console.error("Error parsing assignedTo:", e);
            }
        }

        if (stages) {
            try {
                const stagesArray = JSON.parse(stages);
                if (Array.isArray(stagesArray) && stagesArray.length > 0) {
                    query.stage = { $in: stagesArray };
                }
            } catch (e) {
                console.error("Error parsing stages:", e);
            }
        }

        if (tags) {
            try {
                const tagsArray = JSON.parse(tags);
                if (Array.isArray(tagsArray) && tagsArray.length > 0) {
                    query.tags = { $in: tagsArray };
                }
            } catch (e) {
                console.error("Error parsing tags:", e);
            }
        }

        if (companies) {
            try {
                const companiesArray = JSON.parse(companies);
                if (Array.isArray(companiesArray) && companiesArray.length > 0) {
                    // Adjust this based on your data model
                    // Option 1: If company is stored directly in Lead
                    query.company = { $in: companiesArray };

                    // Option 2: If company is part of contact
                    // This will need to be adjusted based on your schema
                    // query['contact.company'] = { $in: companiesArray };
                }
            } catch (e) {
                console.error("Error parsing companies:", e);
            }
        }

        console.log("Final Query:", JSON.stringify(query, null, 2));

        // Execute the query
        const leads = await Lead.find(query)
            .populate("contact")
            .populate({
                path: "assignedTo",
                select: "firstName lastName",
            })
            .exec();

        console.log(`Fetched ${leads.length} leads with the query`);

        return new Response(JSON.stringify(leads), { status: 200 });
    } catch (error) {
        console.error("Error fetching leads:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch leads" }), { status: 500 });
    }
}

// POST handler for creating a lead
export async function POST(request: Request) {
    // [unchanged code kept as is...]
    try {
        await connectDB();

        const { pipeline, stage, title, description, product, contact, assignedTo, estimateAmount, closeDate, source } = await request.json();

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
            source
        });

        const savedLead = await newLead.save();

        return NextResponse.json(savedLead, { status: 201 });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}