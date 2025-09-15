// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/leadModel";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const contact = searchParams.get("contact");

        const filter: any = {};
        if (contact) {
            filter.contact = contact; // or however your lead references contact
        }

        const leads = await Lead.find(filter)
            .populate("contact")
            .sort({ createdAt: -1 });

        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error("Error fetching leads:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
