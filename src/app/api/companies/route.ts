import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";

import { User } from "@/models/userModel";
import companyModel from "@/models/companyModel";
import { createNotification } from "@/lib/notificationService";
import mongoose from "mongoose";

/**
 * GET  /api/companies  => Fetch all companies for the logged-in user's organization
 * POST /api/companies  => Create a new company under the user's organization
 */
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

        // Fetch companies specific to the user's organization
        const companies = await companyModel.find({ organization: user.organization }).sort({ createdAt: -1 });

        return NextResponse.json(companies, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching companies:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

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

        const data = await request.json();
        const {
            companyName,
            taxNo,
            companyCode,
            country,
            shippingAddress,
            billingAddress,
            state,
            city,
            website,
            pincode,
        } = data;

        if (!companyName || !taxNo || !companyCode) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create company under the logged-in user's organization
        const newCompany = new companyModel({
            companyName,
            taxNo,
            companyCode,
            country,
            shippingAddress,
            billingAddress,
            state,
            city,
            website,
            pincode,
            organization: user.organization, // Assign organization from user
        });

        await newCompany.save();

        await createNotification({
            orgId: user.organization,
            recipientId: new mongoose.Types.ObjectId(userData), // Notify creator
            actorId: new mongoose.Types.ObjectId(userData),
            action: "create",
            entityType: "company",
            entityId: newCompany._id,
            entityName: companyName,
            message: `New company created: ${companyName}`,
            url: `/CRM/companies`,
          });

        return NextResponse.json(newCompany, { status: 201 });
    } catch (error: any) {
        console.error("Error creating company:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
