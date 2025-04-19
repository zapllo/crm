import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { createNotification } from '@/lib/notificationService';
import Lead from '@/models/leadModel';
import { User } from '@/models/userModel';
import mongoose from 'mongoose';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { leadId, text, audioLink, } = await req.json();

        if (!leadId || (!text && !audioLink)) {
            return new Response(
                JSON.stringify({ error: 'Lead ID and either text or audioLink are required' }),
                { status: 400 }
            );
        }
        const userData = getDataFromToken(req);
        const createdBy = userData; // userData is already the user ID
        const lead = await Lead.findById(leadId);
        if (!lead) {
            return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404 });
        }

        const newNote = {
            text,
            audioLink,
            createdBy,
            timestamp: new Date(),
        };

        lead.notes.push(newNote);
        lead.timeline.push({
            stage: "Note Added",
            action: "Note added to lead",
            remark: text || "Audio Note Added",
            movedBy: createdBy,
            timestamp: new Date(),
        });

        await lead.save();

        await createNotification({
          orgId: lead.organization,
          recipientId: lead.assignedTo || createdBy,
          actorId:  lead.assignedTo ,
          action: "note",
          entityType: "lead",
          entityId: lead._id,
          entityName: lead.title,
          message: `Note added: ${text?.substring(0, 50)}${text?.length > 50 ? '...' : ''}`,
          url: `/CRM/leads/${leadId}?tab=notes`,
        });
        // Fetch the user's info to return with the response
        const user = await User.findById(createdBy).select('firstName lastName profileImage');
        const enrichedNote = {
            ...newNote,
            createdByName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
            profileImage: user?.profileImage || null
        };

        return new Response(JSON.stringify({
            message: 'Note added successfully',
            note: enrichedNote
        }), {
            status: 201,
        });
    } catch (error) {
        console.error('Error creating note:', error);
        return new Response(JSON.stringify({ error: 'Failed to create note' }), { status: 500 });
    }
}


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');

    try {
        await connectDB();

        const lead = await Lead.findById(leadId).select('notes');
        if (!lead) {
            return new Response(JSON.stringify({ error: 'Lead not found' }), { status: 404 });
        }

        // Get a list of all user IDs from notes
        const userIds = lead.notes.map((note: any) => note.createdBy).filter((id: any) => id);

        // Fetch user information for all these IDs in one query
        const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName profileImage');

        // Create a map of user information
        const userMap = users.reduce<Record<string, { name: string, profileImage: string | null }>>((map, user) => {
            map[user._id.toString()] = {
                name: `${user.firstName} ${user.lastName}`,
                profileImage: user.profileImage || null
            };
            return map;
        }, {});

        // Enrich notes with user information
        const enrichedNotes = lead.notes.map((note: any) => {
            const userInfo = userMap[note.createdBy] || { name: 'Unknown User', profileImage: null };
            return {
                ...note.toObject(),
                createdByName: userInfo.name,
                profileImage: userInfo.profileImage
            };
        });

        return new Response(JSON.stringify(enrichedNotes), { status: 200 });
    } catch (error) {
        console.error('Error fetching notes:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch notes' }), { status: 500 });
    }
}

