// /app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/models/userModel';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    await connectDB();
    
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password.' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Generate JWT
    if (!process.env.JWT_SECRET_KEY) {
      console.error('JWT_SECRET_KEY is not defined in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Create a simpler payload - minimize data in token
    const tokenPayload = { 
      userId: user._id.toString(),
      email: user.email
    };

    // Explicitly set algorithm and other options 
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, {
      expiresIn: '7d',
      algorithm: 'HS256'
    });

    // Create response with redirectTo
    const response = NextResponse.json({ 
      message: 'Login successful',
      success: true,
      redirectTo: '/CRM/dashboard',
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    }, { status: 200 });
    
    // Set cookie with explicit options
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 604800, // 7 days in seconds
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });

    console.log('Login successful, token generated and stored in cookie');
    return response;
  } catch (error: any) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Server error', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}