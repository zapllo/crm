// app/api/contacts/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/contactModel";
import { Types } from "mongoose";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import companyModel from "@/models/companyModel";

/**
 * GET  /api/contacts => fetch all contacts (populating company) for the user's organization
 * POST /api/contacts => create a contact (with a company reference) under the user's organization
 * DELETE /api/contacts => delete a contact by ID (sent in the body)
 */

export async function GET(request: Request) {
    try {
        await connectDB();

        // 1. Get userId from token
        const userId = getDataFromToken(request);
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

        // 3. Get all companies for this organization
        const orgCompanies = await companyModel.find({ 
            organization: user.organization 
        });
        
        const companyIds = orgCompanies.map(company => company._id);

        // 4. Find contacts that belong to the organization's companies
        const contacts = await Contact.find({
            company: { $in: companyIds }
        }).populate("company").sort({ createdAt: -1 });

        return NextResponse.json(contacts, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        
        // 1. Get userId from token
        const userId = getDataFromToken(request);
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

        const data = await request.json();
        const {
            companyId,
            firstName,
            lastName,
            email,
            country,
            whatsappNumber,
            state,
            city,
            pincode,
            address,
            dateOfBirth,
            dateOfAnniversary,
            customFieldValues
        } = data;

        if (!companyId || !firstName || !lastName || !email || !whatsappNumber) {
            return NextResponse.json(
                { error: "Missing required fields." },
                { status: 400 }
            );
        }

        // Validate the companyId
        if (!Types.ObjectId.isValid(companyId)) {
            return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
        }

        // 3. Verify the company belongs to the user's organization
        const company = await companyModel.findById(companyId);
        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }
        
        if (company.organization.toString() !== user.organization.toString()) {
            return NextResponse.json({ error: "Company does not belong to your organization" }, { status: 403 });
        }

        const newContact = new Contact({
            company: companyId,
            firstName,
            lastName,
            email,
            country,
            whatsappNumber,
            state,
            city,
            pincode,
            address,
            dateOfBirth: dateOfBirth || null,
            dateOfAnniversary: dateOfAnniversary || null,
            customFieldValues
        });

        await newContact.save();
        return NextResponse.json(newContact, { status: 201 });
    } catch (error: any) {
        console.error("Error creating contact:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
