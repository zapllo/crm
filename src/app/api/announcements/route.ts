import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Announcement from '@/models/Announcement';

// GET handler to retrieve all active announcements
export async function GET() {
  try {
    await connectDB();

    const announcements = await Announcement.find({ 
      isActive: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST handler to create a new announcement (admin only)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    await connectDB();

    // Here you would add authentication and authorization checks

    const newAnnouncement = new Announcement(data);
    await newAnnouncement.save();

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}