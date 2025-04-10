import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/productModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

// POST: Create Product
export async function POST(request: Request) {
    try {
        await connectDB();
        // Get logged-in user ID from token
        const userData = getDataFromToken(request);
        if (!userData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Find the user in the database
        const user = await User.findById(userData).select("organization");
        if (!user?.organization) {
            return NextResponse.json({ error: "User organization not found" }, { status: 403 });
        }

        const productData = await request.json();

        // Add organization ID to the product data
        const newProductData = {
            ...productData,
            organization: user.organization
        };

        const newProduct = new Product(newProductData);
        const savedProduct = await newProduct.save();

        return NextResponse.json(savedProduct, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);

        // Handle duplicate product name within organization
        if (error.code === 11000) {
            return NextResponse.json({
                error: 'A product with this name already exists in your organization'
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// GET: Fetch all products for the current organization
export async function GET(request: Request) {
    try {
        await connectDB();

        // Get logged-in user ID from token
        const userData = getDataFromToken(request);
        if (!userData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Find the user in the database
        const user = await User.findById(userData).select("organization");
        if (!user?.organization) {
            return NextResponse.json({ error: "User organization not found" }, { status: 403 });
        }

        // Find products for this organization only
        const products = await Product.find({ organization: user.organization })
            .populate({
                path: "category",
                model: "Category",
            })
            .populate({
                path: "unit",
                model: "Unit",
            });

        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// DELETE: Delete a product (only if it belongs to user's organization)
export async function DELETE(request: Request) {
    try {
        await connectDB();

        // Get logged-in user ID from token
        const userData = getDataFromToken(request);
        if (!userData) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Find the user in the database
        const user = await User.findById(userData).select("organization");
        if (!user?.organization) {
            return NextResponse.json({ error: "User organization not found" }, { status: 403 });
        }

        const { id } = await request.json();

        // Find the product to ensure it belongs to this organization
        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check if the product belongs to the user's organization
        if (product.organization.toString() !== user.organization.toString()) {
            return NextResponse.json({ error: 'Unauthorized to delete this product' }, { status: 403 });
        }

        // Delete the product
        await Product.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
