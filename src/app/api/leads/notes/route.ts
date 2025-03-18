import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';
import Lead from '@/models/leadModel';

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
        const createdBy = getDataFromToken(req);
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
        // Add entry to the timeline properly
        lead.timeline.push({
            stage: "Note Added",
            action: "Note added to lead",
            remark: text || "Audio Note Added",
            movedBy: createdBy,  // Ensure this is the logged-in user ID
            timestamp: new Date(),
        });

        await lead.save();

        return new Response(JSON.stringify({ message: 'Note added successfully', note: newNote }), {
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

        return new Response(JSON.stringify(lead.notes), { status: 200 });
    } catch (error) {
        console.error('Error fetching notes:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch notes' }), { status: 500 });
    }
}

