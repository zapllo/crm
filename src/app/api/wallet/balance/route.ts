import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wallet from '@/models/walletModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';
import { Organization } from '@/models/organizationModel';

export async function GET(req: NextRequest) {
    try {
        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 403 });
        }

        await connectDB();

        let wallet = await Wallet.findOne({
            organizationId: user.organization,
        });

        // Create wallet if it doesn't exist
        if (!wallet) {
            wallet = new Wallet({
                organizationId: user.organization,
                balance: 0, // Start with zero balance
                currency: 'INR',
                transactions: [],
            });

            await wallet.save();
        }

        // **NEW: Sync organization credits with wallet balance**
        const organization = await Organization.findById(user.organization);
        if (organization && organization.credits !== wallet.balance) {
            organization.credits = wallet.balance;
            await organization.save();
        }

        return NextResponse.json({
            balance: wallet.balance,
            currency: wallet.currency,
        });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet balance' },
            { status: 500 }
        );
    }
}