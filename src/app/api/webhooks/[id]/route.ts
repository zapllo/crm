import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from "@/lib/getDataFromToken";
import Webhook from '@/models/webhookModel';
import { User } from "@/models/userModel";
import crypto from 'crypto';
import connectDB from '@/lib/db';

export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        // Extract user ID from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find user and get their organization
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        const webhook = await Webhook.findOne({
            _id: id,
            organization: user.organization
        });

        if (!webhook) {
            return NextResponse.json(
                { error: "Webhook not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ webhook });
    } catch (error) {
        console.error('Error fetching webhook:', error);
        return NextResponse.json(
            { error: "Failed to fetch webhook" },
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

        // Extract user ID from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find user and get their organization
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        const body = await req.json();
        const { name, url, events, status } = body;

        // Validate required fields
        if (!name || !url || !events || events.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const webhook = await Webhook.findOneAndUpdate(
            {
                _id: id,
                organization: user.organization
            },
            {
                name,
                url,
                events,
                status,
            },
            { new: true }
        );

        if (!webhook) {
            return NextResponse.json(
                { error: "Webhook not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ webhook });
    } catch (error) {
        console.error('Error updating webhook:', error);
        return NextResponse.json(
            { error: "Failed to update webhook" },
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

        // Extract user ID from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find user and get their organization
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        const webhook = await Webhook.findOneAndDelete({
            _id: id,
            organization: user.organization
        });

        if (!webhook) {
            return NextResponse.json(
                { error: "Webhook not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting webhook:', error);
        return NextResponse.json(
            { error: "Failed to delete webhook" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id
        await connectDB();

        // Extract user ID from token
        const userId = getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find user and get their organization
        const user = await User.findById(userId);
        if (!user || !user.organization) {
            return NextResponse.json({ error: "User or organization not found" }, { status: 404 });
        }

        const webhook = await Webhook.findOne({
            _id: id,
            organization: user.organization
        });

        if (!webhook) {
            return NextResponse.json(
                { error: "Webhook not found" },
                { status: 404 }
            );
        }

        // This endpoint is for testing the webhook
        // Send a test payload to the webhook URL
        const testPayload = {
            event: "test.event",
            timestamp: new Date().toISOString(),
            data: {
                message: "This is a test payload"
            }
        };

        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Signature': createSignature(testPayload, webhook.secret)
                },
                body: JSON.stringify(testPayload)
            });

            if (response.ok) {
                await Webhook.findByIdAndUpdate(id, {
                    lastTriggered: new Date(),
                    $inc: { successCount: 1 }
                });

                return NextResponse.json({ success: true, message: "Test webhook sent successfully" });
            } else {
                await Webhook.findByIdAndUpdate(id, {
                    $inc: { failureCount: 1 }
                });

                return NextResponse.json(
                    { error: `Webhook test failed with status: ${response.status}` },
                    { status: 400 }
                );
            }
        } catch (error) {
            await Webhook.findByIdAndUpdate(id, {
                $inc: { failureCount: 1 }
            });

            return NextResponse.json(
                { error: "Failed to send test webhook" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error testing webhook:', error);
        return NextResponse.json(
            { error: "Failed to test webhook" },
            { status: 500 }
        );
    }
}

// Helper function to create webhook signature
function createSignature(payload: any, secret: string) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
}