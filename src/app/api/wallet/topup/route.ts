import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/db';
import Wallet from '@/models/walletModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';

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

        await connectDB();

        // Calculate GST (18%) and total amount
        const gstAmount = Math.round(amount * 0.18);
        const totalAmount = amount + gstAmount;

        // Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
            key_secret: process.env.RAZORPAY_KEY_SECRET as string,
        });

        // Get organization details
        const organization = await Organization.findById(user.organization);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Create a Razorpay order with GST-inclusive amount
        const orderOptions = {
            amount: totalAmount * 100, // Razorpay amount is in paise (including GST)
            currency: 'INR',
            receipt: `wallet-topup-${Date.now()}`,
            notes: {
                userId: userId,
                organizationId: user.organization.toString(),
                purpose: 'wallet_topup',
                baseAmount: amount.toString(),
                gstAmount: gstAmount.toString(),
                totalAmount: totalAmount.toString()
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        // Return the order details to the client
        return NextResponse.json({
            orderId: order.id,
            amount: order.amount, // This will be totalAmount * 100 (in paise)
            currency: order.currency,
            baseAmount: amount,
            gstAmount: gstAmount,
            totalAmount: totalAmount,
            notes: order.notes,
            user: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                contact: user.whatsappNo || ''
            },
            organization: {
                name: organization.companyName || 'Your Organization'
            }
        });
    } catch (error) {
        console.error('Error creating Razorpay order for wallet topup:', error);
        return NextResponse.json(
            { error: 'Failed to create payment order' },
            { status: 500 }
        );
    }
}