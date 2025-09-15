import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import followupModel from "@/models/followupModel";
import FollowUp from "@/models/followupModel";
import Lead from '@/models/leadModel'
import { User } from "@/models/userModel";
import { NextResponse } from "next/server";




export async function GET(request: Request) {
    try {
        await connectDB();

        // Extract user ID from token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find user and get their organization
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        // Fetch all follow-ups and populate the 'lead' field

        // Fetch all follow-ups, populate 'lead' (including 'contact'), and 'addedBy'
        const followups = await followupModel
            .find()
            .populate({
                path: "lead",
                populate: { path: "contact", select: "firstName lastName email whatsappNumber" }, // Get contact details
            })
            .populate({
                path: "addedBy",
                select: "firstName lastName email", // Get addedBy user details
            });


        // Filter follow-ups that belong to the user's organization
        const filteredFollowups = followups.filter(f => f.lead?.organization?.toString() === user.organization.toString());

        return NextResponse.json(filteredFollowups, { status: 200 });
    } catch (error) {
        console.error("Error fetching followups:", error);
        return NextResponse.json({ error: "Failed to fetch followups" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const { leadId, description, type, followupDate, reminders } = await request.json();
        const addedBy = getDataFromToken(request);

        if (!addedBy) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const followupCount = await followupModel.countDocuments({ lead: leadId });
        const followupId = `F-${followupCount + 1}`;

        const newFollowup = new followupModel({
            followupId,
            lead: leadId,
            addedBy,
            description,
            type,
            followupDate,
            stage: 'Open',
            remarks: [],
            reminders: reminders || [],
        });

        await newFollowup.save();

        return NextResponse.json({ message: "Follow-up created", followup: newFollowup }, { status: 201 });
    } catch (error) {
        console.error("Error creating follow-up:", error);
        return NextResponse.json({ error: "Failed to create follow-up" }, { status: 500 });
    }
}
