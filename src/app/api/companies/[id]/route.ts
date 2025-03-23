// app/api/companies/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import companyModel from "@/models/companyModel";




export async function GET(request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;

        const company = await companyModel.findById(id);
        if (!company) {
            return NextResponse.json({ message: "Company not found" }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error) {
        return NextResponse.json({ error: "Error fetching company" }, { status: 500 });
    }
}


export async function PATCH(request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;
        const data = await request.json();

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

export async function DELETE(request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const { id } = params;
        await companyModel.findByIdAndDelete(id);
        return NextResponse.json({ message: "Company deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
