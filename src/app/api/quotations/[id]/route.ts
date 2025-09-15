import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import QuotationModel from "@/models/quotationModel";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id

        await connectDB();

        // 1. Get userId from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.organization) {
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        // Find quotation by ID with proper population - include more contact fields
        const quotation = await QuotationModel.findOne({
            _id: id,
            organization: user.organization,
        })
            .populate("lead", "title leadId amount closeDate description")
            .populate("contact", "firstName lastName email whatsappNumber address city state country pincode")
            .populate("creator", "firstName lastName email")
            .lean();

        if (!quotation) {
            return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
        }

        return NextResponse.json(quotation);
    } catch (error) {
        console.error("Error fetching quotation:", error);
        return NextResponse.json(
            { error: "Failed to fetch quotation" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id

        await connectDB();

        // 1. Get userId from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.organization) {
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        const data = await req.json();

        // Update quotation
        const updatedQuotation = await QuotationModel.findOneAndUpdate(
            {
                _id: id,
                organization: user.organization,
            },
            { ...data, updatedAt: new Date() },
            { new: true }
        )
            .populate("lead", "title leadId amount closeDate description")
            .populate("contact", "firstName lastName email whatsappNumber address city state country pincode")
            .populate("creator", "firstName lastName email");

        if (!updatedQuotation) {
            return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
        }

        return NextResponse.json(updatedQuotation);
    } catch (error) {
        console.error("Error updating quotation:", error);
        return NextResponse.json(
            { error: "Failed to update quotation" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id

        await connectDB();

        // 1. Get userId from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.organization) {
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        // Delete quotation
        const deletedQuotation = await QuotationModel.findOneAndDelete({
            _id: id,
            organization: user.organization,
        });

        if (!deletedQuotation) {
            return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Quotation deleted successfully" });
    } catch (error) {
        console.error("Error deleting quotation:", error);
        return NextResponse.json(
            { error: "Failed to delete quotation" },
            { status: 500 }
        );
    }
}