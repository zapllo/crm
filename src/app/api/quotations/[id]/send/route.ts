import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/userModel";
import QuotationModel from "@/models/quotationModel";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendQuotationEmail } from "@/lib/emailTemplates";

export async function POST(req: Request,
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
            return NextResponse.json({ error: "Missing organization" }, { status: 400 });
        }

        const quotationId = id;
        // Safely parse the request body
        let recipientEmail, subject, message;
        try {
            const body = await req.json();
            recipientEmail = body.recipientEmail;
            subject = body.subject;
            message = body.message;
        } catch (error) {
            console.error("Error parsing request body:", error);
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        // Validate input
        if (!recipientEmail) {
            return NextResponse.json(
                { error: "Recipient email is required" },
                { status: 400 }
            );
        }

        // Find quotation
        const quotation = await QuotationModel.findOne({
            _id: quotationId,
            organization: user.organization,
        })
            .populate("creator", "firstName lastName email")
            .populate("contact", "firstName lastName email")
            .populate("lead", "title");

        if (!quotation) {
            return NextResponse.json(
                { error: "Quotation not found" },
                { status: 404 }
            );
        }

        // Update status from draft to sent if needed
        if (quotation.status === 'draft') {
            quotation.status = 'sent';
            await quotation.save();
        }

        // Send email
        await sendQuotationEmail({
            to: recipientEmail,
            subject: subject || `Quotation: ${quotation.title} (${quotation.quotationNumber})`,
            message: message || '',
            firstName: quotation.contact && typeof quotation.contact === 'object' && 'firstName' in quotation.contact ? String(quotation.contact.firstName) : "Client",
            quotationDetails: {
                quotationNumber: quotation.quotationNumber,
                title: quotation.title,
                total: quotation.total,
                currency: quotation.currency,
                validUntil: quotation.validUntil ? quotation.validUntil.toISOString() : '',
                senderName: quotation.creator && typeof quotation.creator === 'object' && 'firstName' in quotation.creator && 'lastName' in quotation.creator ? `${String(quotation.creator.firstName)} ${String(quotation.creator.lastName)}` : "Sender",
                publicAccessToken: quotation.publicAccessToken,
            },
            userId: userId,
        });

        return NextResponse.json(
            { success: true, message: "Quotation sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending quotation:", error);
        return NextResponse.json(
            { error: "Failed to send quotation" },
            { status: 500 }
        );
    }
}