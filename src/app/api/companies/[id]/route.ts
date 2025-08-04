import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import companyModel from "@/models/companyModel";
// Add segment config
export const dynamic = 'force-dynamic';

// Change the parameter structure to use context object
export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();
        const company = await companyModel.findById(id);
        if (!company) {
            return NextResponse.json({ message: "Company not found" }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching company" }, { status: 500 });
    }
}

export async function PATCH(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        const data = await req.json();

        const updatedCompany = await companyModel.findByIdAndUpdate(id, data, {
            new: true,
        });
        if (!updatedCompany) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(updatedCompany, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();
        await companyModel.findByIdAndDelete(id);
        return NextResponse.json({ message: "Company deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}