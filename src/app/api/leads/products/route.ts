import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Lead from "@/models/leadModel"; // Ensure this is the correct path for your model

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Extract product ID from query params
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("productId");

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        // Fetch leads that are associated with the given product ID
        const leads = await Lead.find({ product: productId }).populate("product").populate("assignedTo").populate("contact");

        return NextResponse.json(leads, { status: 200 });
    } catch (error) {
        console.error("Error fetching leads for product:", error);
        return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
    }
}
