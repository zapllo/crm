import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        // Create response with the success message
        const response = NextResponse.json(
            {
                message: "Logout successful",
                success: true,
                redirectTo: '/login'
            }
        );
        
        // Clear the token cookie by setting it to an empty string
        // and setting expires to a date in the past
        response.cookies.set({
            name: "token",
            value: "",
            httpOnly: true,
            path: '/',
            expires: new Date(0),
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        });

        return response;
    } catch (error: any) {
        console.error('Logout error:', error.message);
        return NextResponse.json({ 
            error: error.message || 'An error occurred during logout'
        }, { status: 500 });
    }
}