import connectDB from "@/lib/db";
import leadModel from "@/models/leadModel";
import contactModel from "@/models/contactModel"; // Import the Contact model explicitly
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("company");

    await connectDB();

    try {
        // Fetch leads where the associated contact's company matches the given companyId
        const leads = await leadModel.find({ "contact.company": companyId })
            .populate({
                path: "contact",   // Populate the 'contact' field
                model: contactModel, // Explicitly define the Contact model
            });

        return NextResponse.json(leads);
    } catch (error) {
        console.error("Error fetching leads:", error);
        return NextResponse.json({ error: "Error fetching leads" }, { status: 500 });
    }
}
