import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath = ['/login', '/signup', '/verifyemail'].includes(path);
    const WEBHOOK_PATHS = [
        '/api/calls/webhook',
        '/api/calls/transcription',
        '/api/calls/twiml',
    ];
    // Get the token and loginTime from cookies
    const token = request.cookies.get('token')?.value || '';
    const loginTime = request.cookies.get('loginTime')?.value || '';

    // Mobile device detection using User-Agent
    // If this is a Twilio webhook path, add a special header to identify it
    if (WEBHOOK_PATHS.some(webhookPath => path.startsWith(webhookPath))) {
        // Add a custom header to identify this as a webhook request
        // This header will be used in your getDataFromToken function to skip auth checks
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-webhook-request', 'true');

        // Create a new request with the modified headers
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    if (loginTime) {
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - Number(loginTime);

        const fifteenDaysInMilliseconds = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds

        if (elapsedTime > fifteenDaysInMilliseconds) {
            // If more than 15 days have passed, clear cookies and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.nextUrl));
            response.cookies.set('token', '', { maxAge: 0, path: '/' }); // Clear the token cookie
            response.cookies.set('loginTime', '', { maxAge: 0, path: '/' }); // Clear the loginTime cookie
            return response;
        }
    }
    // Validate JWT expiration if a token exists
    if (token) {
        try {
            const { exp } = JSON.parse(atob(token.split('.')[1])); // Decode the JWT payload
            const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000);

            if (exp && exp < currentTimeInSeconds) {
                // JWT is expired, clear cookies and redirect to login
                const response = NextResponse.redirect(new URL('/login', request.nextUrl));
                response.cookies.set('token', '', { maxAge: 0, path: '/' }); // Clear the token cookie
                response.cookies.set('loginTime', '', { maxAge: 0, path: '/' }); // Clear the loginTime cookie
                return response;
            }
        } catch (error) {
            // If token parsing fails, clear cookies and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.nextUrl));
            response.cookies.set('token', '', { maxAge: 0, path: '/' }); // Clear the token cookie
            response.cookies.set('loginTime', '', { maxAge: 0, path: '/' }); // Clear the loginTime cookie
            return response;
        }
    }

    // Redirect logic for public and protected paths
    if (isPublicPath && token) {
        // If trying to access a public path with a token, redirect to the dashboard
        return NextResponse.redirect(new URL('/CRM/dashboard', request.nextUrl));
    }

    if (!isPublicPath && !token) {
        // If trying to access a protected path without a token, redirect to login
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    // Allow access to the requested path
    return NextResponse.next();
}

// Specify the paths for which this middleware should be executed
export const config = {
    matcher: [
        '/CRM/dashboard/:path*',
        '/settings/:path*',
        '/help/:path*',
        '/login',
        '/signup',
        '/verifyemail',
    ],
};
