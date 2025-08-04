import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Your Unsplash access key should be in environment variables
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Unsplash API key not configured' },
        { status: 500 }
      );
    }

    const response = await axios.get(
      `https://api.unsplash.com/search/photos`,
      {
        params: {
          query,
          per_page: 20,
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error searching Unsplash:', error);
    return NextResponse.json(
      { error: 'Failed to search Unsplash' },
      { status: 500 }
    );
  }
}
