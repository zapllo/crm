import { NextResponse } from 'next/server';
import { User } from '@/models/userModel';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/lib/getDataFromToken';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await request.json();
    const { imageUrl } = data;
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'Profile image updated successfully',
      profileImage: updatedUser.profileImage
    });
  } catch (error: any) {
    console.error('Upload profile image error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}