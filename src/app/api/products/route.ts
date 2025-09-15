import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/productModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import { createNotification } from '@/lib/notificationService';
import mongoose from 'mongoose';

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

        // Generate a unique barcode for the product
        // Format: ORG prefix (first 3 chars of org ID) + timestamp + random 4-digit number
        const orgPrefix = user.organization.toString().substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().substring(7, 13); // Use part of timestamp
        const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
        const barcode = `${orgPrefix}${timestamp}${randomSuffix}`;

        // Add organization ID and barcode to the product data
        const newProductData = {
            ...productData,
            organization: user.organization,
            barcode: barcode
        };

        const newProduct = new Product(newProductData);
        const savedProduct = await newProduct.save();

        await createNotification({
            orgId: user.organization,
            recipientId: new mongoose.Types.ObjectId(userData), // Notify creator
            actorId: new mongoose.Types.ObjectId(userData),
            action: "create",
            entityType: "product",
            entityId: savedProduct._id,
            entityName: savedProduct.name,
            message: `New product created: ${savedProduct.name}`,
            url: `/CRM/products`,
          });

          // Notify admin users about new product
          const adminUsers = await User.find({
            organization: user.organization,
            isOrgAdmin: true,
            _id: { $ne: userData } // Exclude the creator
          }).select('_id');

          if (adminUsers.length > 0) {
            await createNotification({
              orgId: user.organization,
              recipientId: adminUsers.map(admin => new mongoose.Types.ObjectId(admin._id)), // Notify all admins
              actorId: new mongoose.Types.ObjectId(userData),
              action: "create",
              entityType: "product",
              entityId: savedProduct._id,
              entityName: savedProduct.name,
              message: `${user.firstName} ${user.lastName} created a new product: ${savedProduct.name}`,
              url: `/CRM/products`,
            });
          }

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
