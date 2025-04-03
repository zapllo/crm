import { NextRequest, NextResponse } from "next/server";
import QuotationModel from "@/models/quotationModel";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

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

        // Find quotation by ID
        const quotation = await QuotationModel.findOne({
            _id: id,
            organization: user.organization,
        })
            .populate("lead", "title leadId")
            .populate("contact", "firstName lastName email whatsappNumber")
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

export async function PUT(req: Request,
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

        // Parse request body
        const data = await req.json();

        // Find quotation
        const quotation = await QuotationModel.findOne({
            _id: id,
            organization: user.organization,
        });

        if (!quotation) {
            return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
        }

        // Update quotation fields
        quotation.title = data.title;
        quotation.items = data.items.map((item: any) => ({
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            total: item.total
        }));
        quotation.subtotal = data.subtotal;

        // Update discount if provided
        if (data.discountValue > 0) {
            quotation.discount = {
                type: data.discountType,
                value: data.discountValue,
                amount: data.discountAmount
            };
        } else {
            quotation.discount = undefined;
        }

        // Update tax if provided
        if (data.taxPercentage > 0) {
            quotation.tax = {
                name: data.taxName,
                percentage: data.taxPercentage,
                amount: data.taxAmount
            };
        } else {
            quotation.tax = undefined;
        }

        quotation.shipping = data.shipping || 0;
        quotation.total = data.total;
        quotation.currency = data.currency;
        quotation.validUntil = data.validUntil;
        quotation.status = data.status;

        // Update terms
        quotation.terms = data.terms.map((term: any) => ({
            title: term.title,
            content: term.content
        }));

        // Add note if provided
        if (data.notes) {
            quotation.notes.push({
                content: data.notes,
                createdBy: new mongoose.Types.ObjectId(userId),
                timestamp: new Date()
            });
        }

        // If status changed, add to approval history
        if (data.status !== quotation.status) {
            quotation.approvalHistory.push({
                status: data.status as 'pending' | 'approved' | 'revision_requested',
                updatedBy: new mongoose.Types.ObjectId(userId),
                comment: data.statusComment,
                timestamp: new Date()
            });
        }

        // Save updated quotation
        await quotation.save();

        return NextResponse.json(quotation);
    } catch (error) {
        console.error("Error updating quotation:", error);
        return NextResponse.json(
            { error: "Failed to update quotation" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request,
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

        // Check if user has permission to delete (for example, only creator or admin can delete)
        const quotation = await QuotationModel.findOne({
            _id: id,
            organization: user.organization,
        });

        if (!quotation) {
            return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
        }

        // Only allow deletion of draft quotations or by the creator
        const isDraft = quotation.status === 'draft';
        const isCreator = quotation.creator.toString() === userId;
        const isAdmin = user.isOrgAdmin;

        if (!isDraft && !isCreator && !isAdmin) {
            return NextResponse.json(
                { error: "Permission denied. Only draft quotations can be deleted by non-creators" },
                { status: 403 }
            );
        }

        // Delete the quotation
        await QuotationModel.deleteOne({ _id: id });

        return NextResponse.json(
            { message: "Quotation deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting quotation:", error);
        return NextResponse.json(
            { error: "Failed to delete quotation" },
            { status: 500 }
        );
    }
}