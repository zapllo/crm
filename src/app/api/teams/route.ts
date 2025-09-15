// /app/api/teams/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Team } from "@/models/teamModel";

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const orgId = searchParams.get("orgId");
        if (!orgId) {
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        const teams = await Team.find({ organization: orgId })
            .populate("members")
            .sort({ createdAt: -1 });
        return NextResponse.json(teams, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();
        const { name, members, orgId } = data;

        if (!name || !orgId) {
            return NextResponse.json({ error: "Missing name or orgId" }, { status: 400 });
        }

        const newTeam = await Team.create({
            name,
            organization: orgId,
            members: members || [],
        });

        return NextResponse.json(newTeam, { status: 201 });
    } catch (error: any) {
        console.error("Error creating team:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
