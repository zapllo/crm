// /app/api/roles/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Role } from "@/models/roleModel";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

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


        // Only fetch roles in that org
        const roles = await Role.find({ organization: orgId }).sort({ createdAt: -1 });
        return NextResponse.json(roles, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        // Get userId from the token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the user and their organization
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const organizationId = user.organization;
        if (!organizationId) {
            return NextResponse.json({ error: 'User has no associated organization' }, { status: 400 });
        }

        // Parse request body
        const data = await request.json();
        const { name, leadAccess, pages, features } = data;

        if (!name || !leadAccess ) {
            return NextResponse.json(
                { error: "Missing required fields (name, leadAccess, orgId)" },
                { status: 400 }
            );
        }

        const newRole = await Role.create({
            organization: organizationId,
            name,
            leadAccess,
            pagePermissions: pages || [],
            featurePermissions: features || [],
        });

        return NextResponse.json(newRole, { status: 201 });
    } catch (error: any) {
        console.error("Error creating role:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
