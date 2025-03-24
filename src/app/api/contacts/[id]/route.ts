import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contact from "@/models/contactModel";
// Import the Company model so Mongoose can populate with it
import Company from "@/models/companyModel";
import contactTagModel from "@/models/contactTagModel";

// (Optionally, if you want to populate tags with a ContactTag model, import that too.)
// import ContactTag from "@/models/contactTagModel";

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
            })
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
