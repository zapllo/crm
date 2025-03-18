// app/api/companies/[id]/route.ts

import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Company } from "@/models/companyModel";

interface Params {
    params: { id: string };
}

export async function PATCH(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { id } = params;
        const data = await request.json();

        const updatedCompany = await Company.findByIdAndUpdate(id, data, {
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

export async function DELETE(request: Request, { params }: Params) {
    try {
        await connectDB();
        const { id } = params;
        await Company.findByIdAndDelete(id);
        return NextResponse.json({ message: "Company deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
