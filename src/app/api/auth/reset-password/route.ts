import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/userModel';
import PasswordReset from '@/models/PasswordReset';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // Find the reset record
    const resetRecord = await PasswordReset.findOne({ token });
    
    if (!resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
    }

    // Check if token is expired
    if (new Date() > resetRecord.expiresAt) {
      await PasswordReset.deleteOne({ _id: resetRecord._id });
      return NextResponse.json({ error: 'Token has expired. Please request a new password reset.' }, { status: 400 });
    }

    // Find user and update password
    const user = await User.findById(resetRecord.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Update password (this will trigger the pre-save hook that hashes the password)
    user.password = password;
    await user.save();

    // Delete the reset record
    await PasswordReset.deleteOne({ _id: resetRecord._id });

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: "Your Password Has Been Reset",
      text: `Your Zapllo password has been successfully reset. If you didn't make this change, please contact support immediately.`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(90deg, #815bf5 0%, #9f75ff 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Zapllo Logo" style="height: 40px; margin: 0 auto;" />
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <h2 style="color: #333; font-weight: 600; margin-bottom: 15px;">Password Reset Successful</h2>
            
            <p style="margin-bottom: 25px; line-height: 1.6;">Your Zapllo password has been successfully reset. You can now log in with your new password.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background: linear-gradient(90deg, #815bf5 0%, #9f75ff 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-bottom: 25px;">Log In to Your Account</a>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">If you didn't make this change, please <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #815bf5; text-decoration: none;">contact support</a> immediately.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;" />
            
            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} Zapllo. All rights reserved.</p>
          </div>
        </div>
      `,
      userId: user._id.toString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully.'
    });
  } catch (error: any) {
    console.error('Reset password error:', error.message);
    return NextResponse.json({ 
      error: 'Server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}