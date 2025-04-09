import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Organization } from '@/models/organizationModel';
import { Role } from '@/models/roleModel';
import { User } from '@/models/userModel';
import jwt from 'jsonwebtoken';
import { SendEmailOptions, sendEmail } from "@/lib/sendEmail";
import { seedTemplates } from '@/lib/seedTemplates';

// Helper function to format date
const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
};

const sendWebhookNotification = async (
    phoneNumber: string,
    country: string,
    templateName: string,
    bodyVariables: string[]
) => {
    const payload = {
        phoneNumber,
        country,
        bodyVariables,
        templateName,
    };
    console.log(payload, 'payload');
    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`Webhook API error: ${responseData.message}`);
        }
        console.log('Webhook notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending webhook notification:', error);
        throw new Error('Failed to send webhook notification');
    }
};


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
        // Seed default templates for the new organization


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

        await seedTemplates(organization._id.toString(), newUser._id.toString());


        // Format trial expiry date
        const formattedTrialExpires = formatDate(trialExpires);

        // 5) Send first email notification for admin
        const emailSubject = `Business Workspace Creation for Team - ${companyName}!`;
        const emailHtml = `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="padding: 20px; text-align: center;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
          <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
    <h1 style="margin: 0; font-size: 20px;">New Workspace Created</h1>
</div>
            <div style="padding: 20px; text-align: left;">
                <p>Dear <strong>${firstName},</strong></p>
                <p>You have created your Workspace - ${companyName}</p>
                <p>We have started a FREE Trial for your account which is valid till <strong>${formattedTrialExpires}</strong>.</p>
                <p>In the trial period, you can invite up to 100 team members to experience the full capability of our CRM platform.</p>
                 <p>Login to the app now and start managing your leads and customer relationships!</p>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0C874B; color: #ffffff; padding: 12px 24px; font-size: 16px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #888888; text-align: center;">This is an automated notification. Please do not reply.</p>
            </div>
        </div>
    </div>
</body>`;

        const emailOptions: SendEmailOptions = {
            to: email,
            subject: emailSubject,
            text: `Dear ${firstName},\n\nThank you for signing up! Your workspace ${companyName} has been created.`,
            html: emailHtml,
        };

        await sendEmail(emailOptions);

        // 6) Send second email with credentials
        const credentialsEmailSubject = `Business Workspace Invitation to Team - ${companyName}!`;
        const credentialsEmailHtml = `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="padding: 20px; text-align: center;">
         <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
        </div>
        <div style="padding: 20px;">
          <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1731423673/01_xlguy8.png" alt="Team Illustration" style="max-width: 100%; height: auto;">
        </div>
          <h1 style="font-size: 24px; margin: 0; padding: 10px 20px; color: #000000;">Welcome to Team - ${companyName}</h1>
            <div style="padding: 20px;">
                <p>We are excited to have you on board. Here are your account details:</p>
                <p>First Name:<strong> ${firstName}</strong></p>
                <p>Last Name:<strong>${lastName}</strong></p>
                <p>Email:<strong> <a href="mailto:${email}" style="color: #1a73e8;">${email}</a></strong></p>
                <p>Password:<strong> ${password}</strong></p>
                <p>WhatsApp Number:<strong> ${whatsappNo}<strong></p>
                <p>Role:<strong> OrgAdmin</strong></p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0C874B; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Here</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; text-align: center; color: #888888;">This is an automated notification. Please do not reply.</p>
            </div>
        </div>
    </div>
</body>`;

        const credentialsEmailOptions: SendEmailOptions = {
            to: email,
            subject: credentialsEmailSubject,
            text: `Dear ${firstName},\n\nWelcome to ${companyName} team. Your login credentials are: Email: ${email}, Password: ${password}`,
            html: credentialsEmailHtml,
        };

        await sendEmail(credentialsEmailOptions);

        // 7) Send WhatsApp notification
        if (whatsappNo && country) {
            const templateName = 'loginsuccessadmin2';
            const bodyVariables = [firstName, companyName];
            await sendWebhookNotification(whatsappNo, "IN", templateName, bodyVariables);
        }

        // 8) Generate JWT & set as HttpOnly cookie
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

        return response;
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
