// app/api/integrations/indiamart/connect/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import IndiaMartIntegration from "@/models/indiaMartIntegrationModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function POST(request: Request) {
    try {
        await connectDB();
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { apiKey } = await request.json();
        if (!apiKey) {
            return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });
        }

        // Upsert
        const record = await IndiaMartIntegration.findOneAndUpdate(
            { userId },
            { apiKey },
            { upsert: true, new: true }
        );

        return NextResponse.json(record, { status: 200 });
    } catch (error) {
        console.error("Error connecting IndiaMART:", error);
        return NextResponse.json({ error: "Failed to connect IndiaMART" }, { status: 500 });
    }
}
