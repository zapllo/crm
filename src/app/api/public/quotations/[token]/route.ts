import { NextRequest, NextResponse } from "next/server";
import QuotationModel from "@/models/quotationModel";
import connectDB from "@/lib/db";

export async function GET(req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const token = (await params).token
        await connectDB();

        // Find quotation by public access token
        const quotation = await QuotationModel.findOne({
            publicAccessToken: token,
            status: { $in: ['sent', 'approved', 'rejected'] } // Only sent or finalized quotations can be viewed publicly
        })
            .populate("lead", "title")
            .populate("contact", "firstName lastName email whatsappNumber")
            .populate("creator", "firstName lastName email")
            .populate("organization", "companyName");

        if (!quotation) {
            return NextResponse.json({ error: "Quotation not found or not available" }, { status: 404 });
        }

        // Update last viewed time
        quotation.lastViewed = new Date();
        await quotation.save();

        return NextResponse.json(quotation);
    } catch (error) {
        console.error("Error fetching public quotation:", error);
        return NextResponse.json(
            { error: "Failed to fetch quotation" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const token = (await params).token
        await connectDB();

        // Parse request body for approval or comment action
        const data = await req.json();
        const { action, comment, name, email } = data;

        if (!action || !['approve', 'request_revision', 'comment'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Find quotation by public access token
        const quotation = await QuotationModel.findOne({
            publicAccessToken: token,
            status: { $in: ['sent', 'approved', 'rejected'] } // Only sent or finalized quotations can be updated publicly
        });

        if (!quotation) {
            return NextResponse.json({ error: "Quotation not found or not available" }, { status: 404 });
        }

        // Handle different actions
        if (action === 'approve') {
            // Update quotation status to approved
            quotation.status = 'approved';

            // Add approval history entry
            quotation.approvalHistory.push({
                status: 'approved',
                comment: comment || 'Approved without additional comments',
                timestamp: new Date()
            });
        }
        else if (action === 'request_revision') {
            // Require comment for revision requests
            if (!comment) {
                return NextResponse.json({ error: "Comment is required for revision requests" }, { status: 400 });
            }

            // Update quotation status
            quotation.status = 'rejected';

            // Add revision request to history
            quotation.approvalHistory.push({
                status: 'revision_requested',
                comment: comment,
                timestamp: new Date()
            });
        }
        else if (action === 'comment') {
            // Require comment for commenting
            if (!comment) {
                return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
            }

            // Format client name appropriately
            const clientName = name && name.trim() 
                ? name.trim() 
                : quotation.contact && typeof quotation.contact === 'object' && 'firstName' in quotation.contact
                    ? `${quotation.contact.firstName} ${quotation.contact.hasOwnProperty('lastName') ? (quotation.contact as any).lastName : ''}`.trim()
                    : 'Client';
                    
            const clientEmail = email && email.trim()
                ? email.trim()
                : quotation.contact && typeof quotation.contact === 'object' && 'email' in quotation.contact
                    ? String((quotation.contact as any).email)
                    : 'No email provided';

            // Add to approval history to avoid ObjectId issues
            quotation.approvalHistory.push({
                status: 'pending',
                comment: `Comment from ${clientName} (${clientEmail}): ${comment}`,
                timestamp: new Date()
            });
        }

        // Save changes
        await quotation.save();

        return NextResponse.json({
            message: "Action processed successfully",
            status: quotation.status
        });
    } catch (error) {
        console.error("Error processing quotation action:", error);
        return NextResponse.json(
            { error: "Failed to process quotation action" },
            { status: 500 }
        );
    }
}