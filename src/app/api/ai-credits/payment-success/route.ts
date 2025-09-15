import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Wallet from '@/models/walletModel';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId,
        organizationId,
        amount
    } = await request.json();

    // Verify the Razorpay signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    try {
        await connectDB();

        // GST rate (18%)
        const gstRate = 0.18;

        // Calculate the amount before GST
        const amountWithoutGST = amount / (1 + gstRate);

        // This will be the amount credited to the wallet (in paise)
        const creditedAmount = Math.floor(amountWithoutGST);

        // Find or create the wallet
        let wallet = await Wallet.findOne({ organizationId });

        if (!wallet) {
            wallet = new Wallet({
                organizationId,
                balance: 0,
                currency: 'INR',
                transactions: []
            });
        }

        // Add the transaction and update the balance
        wallet.transactions.push({
            type: 'credit',
            amount: creditedAmount,
            description: 'Wallet top-up',
            paymentId: razorpay_payment_id,
            reference: razorpay_order_id,
            metadata: {
                gstAmount: amount - creditedAmount,
                totalAmount: amount
            },
            createdAt: new Date()
        });

        wallet.balance += creditedAmount;
        wallet.lastUpdated = new Date();

        await wallet.save();

        // **NEW: Update organization credits to match wallet balance**
        await Organization.findByIdAndUpdate(
            organizationId,
            { 
                credits: wallet.balance,
                $inc: { 
                    // You can also track total credits purchased if needed
                    // totalCreditsPurchased: creditedAmount 
                }
            }
        );

        return NextResponse.json({ 
            success: true,
            creditedAmount,
            newBalance: wallet.balance
        });
    } catch (error) {
        console.error('Error processing wallet top-up payment:', error);
        return NextResponse.json(
            { error: 'Error processing payment' },
            { status: 500 }
        );
    }
}