import { NextResponse } from 'next/server';
import { User } from '@/models/userModel';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';

export async function PUT(request: Request) {
  try {
    await connectDB();
    
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { firstName, lastName, whatsappNo } = data;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, whatsappNo },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}