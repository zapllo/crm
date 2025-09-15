// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/leadModel";
import contactModel from "@/models/contactModel";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const company = searchParams.get("company");

        const filter: any = {};
        if (company) {
            filter.company = company; // or however your lead references contact
        }

        const contacts = await contactModel.find(filter)
            .populate("company")
            .sort({ createdAt: -1 });

        return NextResponse.json(contacts, { status: 200 });
    } catch (error) {
        console.error("Error fetching leads:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
