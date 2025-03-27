import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Order from '@/models/orderModel';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
// import { sendEmail, SendEmailOptions } from '@/lib/sendEmail';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';

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
            const organizationUpdate: Partial<{
                isPro: boolean;
                subscriptionExpires: Date;
                subscribedPlan: string;
                subscribedUserCount: number;
                userExceed: boolean;
            }> = {
                isPro: true,
                subscriptionExpires,
            };

            const organization = await Organization.findById(user.organization);
            if (!organization) {
                return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
            }


            if (planName !== 'Recharge') {
                organizationUpdate.subscribedPlan = planName;
                organizationUpdate.subscribedUserCount = subscribedUserCount;
                const currentUserCount = await User.countDocuments({ organization: user.organization });

                if (currentUserCount > subscribedUserCount) {
                    organizationUpdate.userExceed = true;
                } else {
                    organizationUpdate.userExceed = false;
                }
            }

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

        // **Send Notifications in the Background**
        Promise.allSettled([
            (async () => {
//                 const emailOptions: SendEmailOptions = {
//                     to: user.email,
//                     subject: 'Thank You for Your Purchase',
//                     text: `Hi ${user.firstName},

// 🎉 Thank you so much for your purchase.

// We are excited to get you up and running soon.

// One of our onboarding specialists will connect with you soon and get your workspace up and running.

// Regards,
// Zapllo Support Team`,
//                     html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
//           <div style="background-color: #f0f4f8; padding: 20px; ">
//               <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
//                   <div style="padding: 20px; text-align: center; ">
//                       <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
//                   </div>
//                 <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
//           <h1 style="margin: 0; font-size: 20px;">Thank You for Your Purchase</h1>
//       </div>
//                            <div style="padding: 20px; color:#000000;">
//                             <p>Hi ${user.firstName},<br/>
//                          <p style="margin-top:4px;">Thank you for subscribing to the ${planName} ! 🎉</p>
//                            <p style="margin-top:4px;">We are excited to get you up and running soon. Here are your subscription details: </p>
//                             <div style="border-radius:8px; margin-top:4px; color:#000000; padding:10px; background-color:#ECF1F6">
//                           <p><strong>Company Name:</strong> ${organization.companyName}</p>
//                           <p><strong>Total Users Subscribed:</strong> ${subscribedUserCount}</p>
//                           <p><strong>Subscription Email ID:</strong> ${user.email}</p> 
//                            </div>
//                              <p style="margin-top:4px;">One of our onboarding specialists will connect with you soon and get your workspace up and running.</p>
//                   Regards,</br>
//                   <p style="margin-top:4px;">Zapllo Support Team </p>
//                   </p>
//                               <p style="margin-top: 20px; text-align:center; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
//                           </div>
//                       </div>
//                   </div>
//               </body>`,
//                 };

//                 await sendEmail(emailOptions);
                console.log('Email sent successfully to', user.email);
            })(),

            sendWebhookNotification(user, planName, organization.companyName, subscribedUserCount),
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating credits and subscription status: ', error);
        return NextResponse.json(
            { error: 'Error updating credits and subscription status' },
            { status: 500 }
        );
    }
}

