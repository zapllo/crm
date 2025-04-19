import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/productModel"; // Ensure correct path

export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const product = await Product.findById(id).populate({
            path: "category",   // Corrected from "Category"
            model: "Category",
        })
            .populate({
                path: "unit",       // Populate the unit as well
                model: "Unit",
            });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id

        if (!id) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const product = await Product.findByIdAndDelete(id)
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}
