import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wallet from '@/models/walletModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

export async function POST(req: NextRequest) {
    try {
        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 403 });
        }

        const { amount } = await req.json();

        // Validate amount
        if (!amount || amount < 100) { // Minimum ₹100
            return NextResponse.json(
                { error: 'Invalid amount. Minimum top-up is ₹100' },
                { status: 400 }
            );
        }

        // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        //     apiVersion: '2023-10-16',
        // });

        // Create a Stripe checkout session
        // const checkoutSession = await stripe.checkout.sessions.create({
        //     payment_method_types: ['card'],
        //     line_items: [
        //         {
        //             price_data: {
        //                 currency: 'inr',
        //                 product_data: {
        //                     name: 'ZaplloCRM Call Credits',
        //                     description: 'Add credits to your calling wallet',
        //                 },
        //                 unit_amount: amount * 100, // Convert to smallest currency unit (paise)
        //             },
        //             quantity: 1,
        //         },
        //     ],
        //     mode: 'payment',
        //     success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
        //     cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/wallet?canceled=true`,
        //     metadata: {
        //         organizationId: user.organization,
        //         userId: user.id,
        //     },
        // });

        return NextResponse.json({
            // sessionId: checkoutSession.id,
            // url: checkoutSession.url,
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
