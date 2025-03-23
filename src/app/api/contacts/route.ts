// app/api/contacts/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/contactModel";
import { Types } from "mongoose";

/**
 * GET  /api/contacts => fetch all contacts (populating company)
 * POST /api/contacts => create a contact (with a company reference)
 * DELETE /api/contacts => delete a contact by ID (sent in the body)
 */

export async function GET() {
    try {
        await connectDB();
        // Populate the "company" field so you can access companyName, etc.
        const contacts = await Contact.find().populate("company").sort({ createdAt: -1 });
        return NextResponse.json(contacts, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const data = await request.json();
        const {
            companyId, // the _id of the company to reference
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


// PATCH endpoint for updating contacts
export async function PATCH(request: Request) {
    try {
        await connectDB();
        const { id, updates } = await request.json();

        if (!id || !updates) {
            return NextResponse.json({ error: "Missing contact ID or updates." }, { status: 400 });
        }

        const updatedContact = await Contact.findByIdAndUpdate(id, updates, { new: true }).populate("company");

        if (!updatedContact) {
            return NextResponse.json({ error: "Contact not found." }, { status: 404 });
        }

        return NextResponse.json(updatedContact, { status: 200 });
    } catch (error) {
        console.error("Error updating contact:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}


// We'll do a DELETE with the contact id in the request body:
export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: "No contact ID provided" }, { status: 400 });
        }

        await Contact.findByIdAndDelete(id);
        return NextResponse.json({ message: "Contact deleted" }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting contact:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
