import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from "@/lib/getDataFromToken";
import ApiKey from '@/models/apiKeyModel';
import { User } from "@/models/userModel";
import connectDB from '@/lib/db';

export async function DELETE(request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();
        // Extract user ID from token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find user and get their organization
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        // Instead of actually deleting, we mark the key as inactive
        const apiKey = await ApiKey.findOneAndUpdate(
            {
                _id: id,
                organization: user.organization
            },
            { isActive: false },
            { new: true }
        );

        if (!apiKey) {
            return NextResponse.json(
                { error: "API key not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error revoking API key:', error);
        return NextResponse.json(
            { error: "Failed to revoke API key" },
            { status: 500 }
        );
    }
}