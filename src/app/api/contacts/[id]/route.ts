import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/contactModel";
// Import the Company model so Mongoose can populate with it
import Company from "@/models/companyModel";
import contactTagModel from "@/models/contactTagModel";
import contactCustomFieldModel from "@/models/contactCustomFieldModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";

export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id

        const contact = await Contact.findById(id)
            // Explicitly specify the "model" key in the population
            .populate({
                path: "company",
                model: Company, // or model: "Company" if you prefer
            }).populate({
                path: "tags",
                model: contactTagModel,
            })// Populate custom field definitions
            .populate({
                path: "customFieldValues.definition",
                model: contactCustomFieldModel,
            });
            ;

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        return NextResponse.json(contact, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function PATCH(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();
        const body = await req.json();
        const updates = body.updates || {};

        const contact = await Contact.findByIdAndUpdate(id, updates, { new: true });

        return NextResponse.json(contact, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        
        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 403 });
        }

        await connectDB();

        // Find the contact
        const contact = await Contact.findById(id);
        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

    
        // Delete the contact
        await Contact.findByIdAndDelete(id);

        return NextResponse.json(
            { message: "Contact deleted successfully" }, 
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting contact:', error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}