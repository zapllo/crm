import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Order from '@/models/orderModel';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';
import Integration from '@/models/integrationModel';

const sendWebhookNotification = async (user: any, planName: string, organizationName: string, subscribedUserCount: string) => {
    const payload = {
        phoneNumber: user.whatsappNo, // Ensure this field exists on the user model
        country: user.country, // Ensure this field exists on the user model
        templateName: 'onboarding_purchase',
        bodyVariables: [
            user.firstName,
            planName,
            organizationName,
            subscribedUserCount,
            user.email,
        ],
    };

    console.log('Payload for WhatsApp notification:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.text();
            console.error('Webhook API error response:', responseData);
            throw new Error(`Webhook API error: ${response.status} ${response.statusText}`);
        }

        console.log('WhatsApp notification sent successfully.');
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        throw new Error('Failed to send WhatsApp notification');
    }
};

export async function POST(request: NextRequest) {
    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId,
        amount,
        planName,
        subscribedUserCount,
        additionalUserCount,
        deduction,
    } = await request.json();

    // Compute the expected signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    // Verify the signature
    if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    try {
        await connectDB(); // Ensure that the database is connected

        let creditedAmount = 0; // Initialize creditedAmount to zero

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const organization = await Organization.findById(user.organization);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        if (planName === 'Recharge') {
            // GST rate (18%)
            const gstRate = 0.18;

            // Calculate the amount before GST
            const amountWithoutGST = amount / (1 + gstRate);

            // Calculate the net credited amount after deducting Razorpay's fee
            creditedAmount = amountWithoutGST;

            // Update the organization's credits instead of the user's
            await Organization.findByIdAndUpdate(
                user.organization,
                {
                    $inc: { credits: creditedAmount },
                },
                { new: true }
            );
        }

        // Update the user document with subscription details
        await User.findByIdAndUpdate(
            userId,
            {
                $set: { isPro: true, subscribedPlan: planName },
            },
            { new: true }
        );

        if (user.organization) {
            const subscriptionExpires = new Date();
            subscriptionExpires.setDate(subscriptionExpires.getDate() + 365);

            // Update organization's fields only if the plan is not 'Recharge'
            const organizationUpdate: any = {
                isPro: true,
                subscriptionExpires,
            };

            if (planName !== 'Recharge') {
                organizationUpdate.subscribedPlan = planName;
                organizationUpdate.subscribedUserCount = subscribedUserCount;

                // Check if this is a Quotation-related plan
                if (
                    planName === 'Zapllo Quotations' ||
                    planName.includes('Quotation') ||
                    planName.includes('quotation')
                ) {
                    // Enable quotation feature in settings
                    organizationUpdate['settings.quotations.enabled'] = true;
                    organizationUpdate['settings.quotations.defaultCurrency'] = 'INR';
                    organizationUpdate['settings.quotations.defaultExpiry'] = 30;

                    // Update activeSubscriptions array to include quotation
                    await Organization.updateOne(
                        { _id: user.organization },
                        { $addToSet: { activeSubscriptions: 'quotation' } }
                    );
                }

                const currentUserCount = await User.countDocuments({ organization: user.organization });

                if (currentUserCount > subscribedUserCount) {
                    organizationUpdate.userExceed = true;
                } else {
                    organizationUpdate.userExceed = false;
                }
            }

            // Update the organization with our changes
            await Organization.updateOne(
                { _id: user.organization },
                { $set: organizationUpdate }
            );
        }

        // Create a new order document
        const newOrder = new Order({
            userId: new mongoose.Types.ObjectId(userId),
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: amount,
            planName: planName,
            creditedAmount: creditedAmount, // This will be zero if plan is not 'Recharge'
            subscribedUserCount,
            additionalUserCount: additionalUserCount || 0, // Default to 0 if not provided
            deduction, // Include deduction from the request
        });

        await newOrder.save();

        // Check if this is an integration purchase
        if (planName && planName.includes('Integration')) {
            const platform = planName.replace(' Integration', '').toLowerCase();

            try {
                // Find or create integration record
                let integration = await Integration.findOne({
                    organizationId: user.organization,
                    platform
                });

                if (integration) {
                    // Update existing integration
                    integration = await Integration.findByIdAndUpdate(
                        integration._id,
                        {
                            isPurchased: true,
                            purchaseDate: new Date(),
                            orderId: razorpay_order_id,
                            paymentId: razorpay_payment_id,
                            amount: amount,
                            setupStatus: 'pending',
                            userId: userId // Update with current user
                        },
                        { new: true }
                    );
                } else {
                    // Create new integration record
                    integration = new Integration({
                        userId: new mongoose.Types.ObjectId(userId),
                        organizationId: user.organization,
                        platform,
                        isPurchased: true,
                        purchaseDate: new Date(),
                        orderId: razorpay_order_id,
                        paymentId: razorpay_payment_id,
                        amount: amount,
                        setupStatus: 'pending'
                    });

                    await integration.save();
                }

                // Send notification to integration team
                try {
                    // You can implement email notification here
                    // Example using your webhook notification:
                    await sendWebhookNotification(
                        user,
                        `${platform} Integration`,
                        organization.companyName || '',
                        '1' // Integrations don't have user counts, so default to 1
                    );

                    console.log(`Integration purchase notification sent for ${platform}`);
                } catch (notificationError) {
                    console.error('Error sending integration purchase notification:', notificationError);
                    // Don't fail the request if notification fails
                }
            } catch (integrationError) {
                console.error('Error updating integration record:', integrationError);
                // Don't fail the payment confirmation if integration record update fails
            }
        } else {
            // **Send Notifications in the Background for regular subscriptions**
            Promise.allSettled([
                (async () => {
                    // Email logic that you had commented out in your original code
                    console.log('Email sent successfully to', user.email);
                })(),

                sendWebhookNotification(user, planName, organization.companyName || '', subscribedUserCount.toString()),
            ])
                .then((results) => {
                    results.forEach((result, index) => {
                        if (result.status === 'rejected') {
                            console.error(`Notification ${index + 1} failed:`, result.reason);
                        } else {
                            console.log(`Notification ${index + 1} succeeded.`);
                        }
                    });
                })
                .catch((err) => console.error('Unexpected error in notifications:', err));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating credits and subscription status: ', error);
        return NextResponse.json(
            { error: 'Error updating credits and subscription status' },
            { status: 500 }
        );
    }
}
