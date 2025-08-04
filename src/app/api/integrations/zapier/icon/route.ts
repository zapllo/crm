import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to your app icon (you'll need to add this file)
    const iconPath = path.join(process.cwd(), 'public', 'logo.png');
    
    // Read the file
    const iconBuffer = fs.readFileSync(iconPath);
    
    // Return the icon with appropriate headers
    return new NextResponse(iconBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (error) {
    console.error('Error serving Zapier icon:', error);
    return NextResponse.json({ error: 'Icon not found' }, { status: 404 });
  }
}