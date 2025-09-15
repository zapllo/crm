import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/userModel';
import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';
import PasswordReset from '@/models/PasswordReset';

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
    
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Find user with this email
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist to prevent user enumeration
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    // Generate a token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store the token in DB
    await PasswordReset.findOneAndUpdate(
      { email: user.email },
      { 
        token,
        expiresAt,
        userId: user._id
      },
      { upsert: true, new: true }
    );

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `Click on the following link to reset your password: ${resetUrl}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(90deg, #815bf5 0%, #9f75ff 100%); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="Zapllo Logo" style="height: 40px; margin: 0 auto;" />
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.05);">
            <h2 style="color: #333; font-weight: 600; margin-bottom: 15px;">Reset Your Password</h2>
            
            <p style="margin-bottom: 25px; line-height: 1.6;">We received a request to reset your password. Click the button below to create a new password. This link will expire in 1 hour.</p>
            
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(90deg, #815bf5 0%, #9f75ff 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; margin-bottom: 25px;">Reset Password</a>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 5px;">If you didn't request a password reset, you can safely ignore this email.</p>
            
            <p style="font-size: 14px; color: #666;">For security, this request was received from: IP [Client IP]</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 25px 0;" />
            
            <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} Zapllo. All rights reserved.</p>
          </div>
        </div>
      `,
      userId: user._id.toString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, a password reset link has been sent.' 
    });
  } catch (error: any) {
    console.error('Forgot password error:', error.message);
    return NextResponse.json({ 
      error: 'Server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}