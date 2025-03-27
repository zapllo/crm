// /app/api/members/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

/**
 * GET /api/members?orgId=ORG_ID
 *  => fetch all users in that org
 *
 * POST /api/members => create new user in that org
 */
export async function GET(request: Request) {
    try {
        await connectDB();

        // 1) Decode token from the cookie
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid or missing token' },
                { status: 401 }
            );
        }

        // 2) Find this user in DB
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 3) Grab the organization from the user doc
        const orgId = currentUser.organization;
        if (!orgId) {
            return NextResponse.json(
                { error: 'User has no organization' },
                { status: 400 }
            );
        }

        // 4) Fetch all members (users) with the same organization and populate role data
        const members = await User.find({ organization: orgId })
            .populate('role')
            .sort({
                createdAt: -1,
            });

        return NextResponse.json(members, { status: 200 });
    } catch (error: any) {
        console.error('Server error in GET /api/members:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        // 1. Get the user ID from the token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Connect to the database
        await connectDB();

        // 3. Find the user by their ID
        const user = await User.findById(userId).populate('role');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const orgId = user.organization

        const data = await request.json();
        const {
            firstName,
            lastName,
            email,
            password, // must be included
            roleId,
            whatsappNo,
        } = data;

        if (!firstName || !lastName || !email || !password || !orgId) {
            return NextResponse.json(
                {
                    error:
                        "Missing required fields (firstName, lastName, email, password, orgId)",
                },
                { status: 400 }
            );
        }

        // Create the user in that org
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            organization:orgId,
            role: roleId || null,
            whatsappNo: whatsappNo || "",
            isOrgAdmin: false,
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error("Error creating member:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
