import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import Lead from '@/models/leadModel';
import Contact from '@/models/contactModel';
import Source from '@/models/sourceModel';
import Pipeline from '@/models/pipelineModel';
import { User } from '@/models/userModel';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Organization } from '@/models/organizationModel';
import { sendLeadAssignmentEmail } from '@/lib/emailTemplates';
import { createNotification } from '@/lib/notificationService';


const sendWebhookNotification = async (
    phoneNumber: string,
    country: string,
    templateName: string,
    bodyVariables: string[]
) => {
    const payload = {
        phoneNumber,
        country,
        bodyVariables,
        templateName,
    };
    console.log(payload, 'payload');
    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`Webhook API error: ${responseData.message}`);
        }
        console.log('Webhook notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending webhook notification:', error);
        throw new Error('Failed to send webhook notification');
    }
};


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

        const { pipeline, stage, title, description, product, contact, assignedTo, estimateAmount, closeDate, source, files, audioRecordings, links, customFieldValues } = await request.json();

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
            source,
            files: files || [],
            audioRecordings: audioRecordings || [],
            links: links || [],
            customFieldValues: customFieldValues || {} // Add this line
        });

        const savedLead = await newLead.save();

        await createNotification({
            orgId: user.organization,
            recipientId: assignedTo || userId, // Send to assignee or creator
            actorId: new mongoose.Types.ObjectId(userId),
            action: "create",
            entityType: "lead",
            entityId: savedLead._id,
            entityName: title,
            message: `New lead created: ${title}`,
            url: `/CRM/leads/${savedLead._id}`,
        });

        // If the lead is assigned to someone other than the creator, add another notification
        if (assignedTo && assignedTo.toString() !== userId.toString()) {
            await createNotification({
                orgId: user.organization,
                recipientId: new mongoose.Types.ObjectId(assignedTo),
                actorId: new mongoose.Types.ObjectId(userId),
                action: "assign",
                entityType: "lead",
                entityId: savedLead._id,
                entityName: title,
                message: `A lead has been assigned to you: ${title}`,
                important: true,
                url: `/CRM/leads/${savedLead._id}`,
            });
        }
        // Send email notification if there's an assignedTo user
        if (assignedTo) {
            // Get the assigned user's email
            const assignedUser = await User.findById(assignedTo);
            if (assignedUser) {
                // Check organization notification settings
                const organization = await Organization.findById(assignedUser.organization);

                // Only send email if the notification setting is enabled
                if (organization && organization.notifications?.newLeadEmail) {
                    // Get contact and source details for the email
                    const contactDetails = await Contact.findById(contact);
                    const sourceDetails = await Source.findById(source);

                    // Prepare and send email
                    // Prepare and send email
                    await sendLeadAssignmentEmail({
                        to: assignedUser.email,
                        firstName: assignedUser.firstName,
                        leadDetails: {
                            title,
                            contactName: contactDetails ? `${contactDetails.firstName} ${contactDetails.lastName}` : 'Not provided',
                            contactNumber: contactDetails?.whatsappNumber || 'Not provided',
                            sourceName: sourceDetails?.name || 'Not specified',
                            leadId: savedLead._id // Include the leadId for the URL
                        }
                    });
                    if (organization?.notifications?.newLeadWhatsapp) {
                        const creatorUser = await User.findById(userId);
                        const creatorName = creatorUser ? creatorUser.firstName : "Admin";

                        try {
                            const today = new Date().toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: '2-digit'
                            })
                            const templateName = 'lead_assignment';
                            const bodyVariables = [`${assignedUser.firstName}`, creatorName, title, `${contactDetails.firstName} ${contactDetails.lastName}`, `${contactDetails?.whatsappNumber}`, `${sourceDetails?.name}`, today, "crm.zapllo.com"]
                            await sendWebhookNotification(`${assignedUser.whatsappNo}`, "IN", templateName, bodyVariables);
                            console.log("Lead assignment WhatsApp notification sent successfully");
                        } catch (error) {
                            console.error("Error sending lead WhatsApp notification:", error);
                            // Continue execution, don't fail the API response
                        }
                    }
                }
            }
        }

        return NextResponse.json(savedLead, { status: 201 });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
