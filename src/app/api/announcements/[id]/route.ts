import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Announcement from '@/models/Announcement';

// PATCH handler to update an announcement
export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        const data = await request.json();

        await connectDB();

        // Here you would add authentication and authorization checks

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );

        if (!updatedAnnouncement) {
            return NextResponse.json(
                { error: 'Announcement not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedAnnouncement);
    } catch (error) {
        console.error('Error updating announcement:', error);
        return NextResponse.json(
            { error: 'Failed to update announcement' },
            { status: 500 }
        );
    }
}

// DELETE handler to remove an announcement
export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id

        await connectDB();

        // Here you would add authentication and authorization checks

        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

        if (!deletedAnnouncement) {
            return NextResponse.json(
                { error: 'Announcement not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json(
            { error: 'Failed to delete announcement' },
            { status: 500 }
        );
    }
}