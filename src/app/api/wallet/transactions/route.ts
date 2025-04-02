import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wallet from '@/models/walletModel';
import { getDataFromToken } from '@/lib/getDataFromToken';
import { User } from '@/models/userModel';

export async function GET(req: NextRequest) {
    try {
        // Get logged-in user ID and organization from the token
        const userId = getDataFromToken(req);

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user?.organization) {
            return NextResponse.json({ error: 'User organization not found' }, { status: 403 });
        }

        const searchParams = req.nextUrl.searchParams;
        const type = searchParams.get('type') || 'all';
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        
        await connectDB();

        // Get the user's wallet
        const wallet = await Wallet.findOne({
            organizationId: user.organization,
        });

        if (!wallet) {
            return NextResponse.json({ transactions: [] });
        }

        // Filter transactions based on type
        let filteredTransactions = wallet.transactions;
if (type !== 'all') {
    filteredTransactions = wallet.transactions.filter((t: any) => t.type === type);
}
        
        // Sort by date (newest first)
filteredTransactions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        // Apply pagination
        const skip = (page - 1) * limit;
        const paginatedTransactions = filteredTransactions.slice(skip, skip + limit);
        
        // Format transactions for the client
const formattedTransactions = paginatedTransactions.map((t: any) => ({
            id: t._id,
            date: t.createdAt,
            type: t.type,
            amount: t.amount,
            description: t.description,
            reference: t.reference || '',
            metadata: t.metadata || {}
        }));

        return NextResponse.json({
            transactions: formattedTransactions,
            totalCount: filteredTransactions.length,
            page,
            limit,
            totalPages: Math.ceil(filteredTransactions.length / limit)
        });
    } catch (error) {
        console.error('Error fetching wallet transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch wallet transactions' },
            { status: 500 }
        );
    }
}