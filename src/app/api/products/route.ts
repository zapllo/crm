import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/productModel';

// POST: Create Product
export async function POST(request: Request) {
    try {
        await connectDB();
        const productData = await request.json();
        const newProduct = new Product(productData);
        const savedProduct = await newProduct.save();

        return NextResponse.json(savedProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}

// GET: Fetch all products
export async function GET() {
    try {
        await connectDB();
        const products = await Product.find();
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}


export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { id } = await request.json();
        await Product.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
