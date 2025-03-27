import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Organization } from '@/models/organizationModel';
import { Role } from '@/models/roleModel';
import { User } from '@/models/userModel';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        await connectDB();

        const data = await request.json();
        const {
            // User fields
            email,
            password,
            confirmPassword,
            firstName,
            lastName,
            whatsappNo,
            // Organization fields
            companyName,
            industry,
            teamSize,
            description,
            country,
            categories = []
        } = data;

        if (!email || !password || !confirmPassword || !firstName || !lastName || !companyName || !industry || !teamSize || !description || !country) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }
        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
        }

        // Set trial expiry to 7 days from now
        const trialExpires = new Date();
        trialExpires.setDate(trialExpires.getDate() + 7);

        // 1) Create Organization
        const organization = await Organization.create({
            companyName,
            industry,
            teamSize,
            description,
            country,
            categories,
            trialExpires,
            users: [] // Will be updated after user creation
        });

        // 2) Create a default "OrgAdmin" role for that new org
        const orgAdminRole = await Role.create({
            organization: organization._id,
            name: 'OrgAdmin',
            leadAccess: 'ALL',
            pagePermissions: [
                { page: 'Leads', canView: true, canEdit: true, canDelete: true, canAdd: true },
                { page: 'Contacts', canView: true, canEdit: true, canDelete: true, canAdd: true }
            ],
            featurePermissions: [
                { feature: 'ExportCSV', enabled: true },
                { feature: 'BulkEmail', enabled: true }
            ]
        });

        // 3) Create the user
        const newUser = await User.create({
            email,
            password,
            firstName,
            lastName,
            whatsappNo,
            isOrgAdmin: true,
            organization: organization._id,
            role: orgAdminRole._id
        });

        // 4) Update organization with user reference
        await Organization.findByIdAndUpdate(
            organization._id,
            { $push: { users: newUser._id } }
        );

        // 5) Generate JWT & set as HttpOnly cookie
        if (!process.env.JWT_SECRET_KEY) {
            throw new Error('JWT_SECRET_KEY is not set in environment variables.');
        }
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });

        // Create a NextResponse and attach Set-Cookie
        const response = NextResponse.json({ message: 'Signup successful' }, { status: 200 });
        response.headers.set(
            'Set-Cookie',
            `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict;`
        );
        // Max-Age = 7 days in seconds (604800). You can add Secure if using HTTPS.

        return response;
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}