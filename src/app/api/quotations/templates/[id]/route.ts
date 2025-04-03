import { NextRequest, NextResponse } from "next/server";
import QuotationTemplateModel from "@/models/quotationTemplateModel";
import { User } from "@/models/userModel";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";


export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        // 1. Get userId from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.organization) {
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        // Find template by ID
        const template = await QuotationTemplateModel.findOne({
            _id: id,
            organization: user.organization,
        });

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error("Error fetching template:", error);
        return NextResponse.json(
            { error: "Failed to fetch template" },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        // 1. Get userId from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.organization) {
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        // Parse request body
        const data = await req.json();

        // Find template
        const template = await QuotationTemplateModel.findOne({
            _id: id,
            organization: user.organization,
        });

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Update template fields
        template.name = data.name;
        template.description = data.description;
        template.isDefault = data.isDefault || false;
        template.previewImage = data.previewImage;

        if (data.layout) {
            template.layout = data.layout;
        }

        if (data.styles) {
            template.styles = data.styles;
        }

        if (data.pageSettings) {
            template.pageSettings = data.pageSettings;
        }

        // Save updated template
        await template.save();

        return NextResponse.json(template);
    } catch (error) {
        console.error("Error updating template:", error);
        return NextResponse.json(
            { error: "Failed to update template" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id

        await connectDB();

        // 1. Get userId from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch the user from DB
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!user.organization) {
            return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
        }

        // Find template
        const template = await QuotationTemplateModel.findOne({
            _id: id,
            organization: user.organization,
        });

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        // Don't allow deleting the default template if it's the only template
        if (template.isDefault) {
            const count = await QuotationTemplateModel.countDocuments({
                organization: user.organization,
            });

            if (count === 1) {
                return NextResponse.json(
                    { error: "Cannot delete the only template. Create another template first." },
                    { status: 400 }
                );
            }
        }

        // Delete the template
        await QuotationTemplateModel.deleteOne({ _id:id });

        return NextResponse.json(
            { messageṄ: "Template deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting template:", error);
        return NextResponse.json(
            { error: "Failed to delete template" },
            { status: 500 }
        );
    }
}