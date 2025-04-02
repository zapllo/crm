// /app/api/members/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { Organization } from "@/models/organizationModel";
import { sendEmail, SendEmailOptions } from "@/lib/sendEmail";

/**
 * GET /api/members?orgId=ORG_ID
 *  => fetch all users in that org
 *
 * POST /api/members => create new user in that org
 */

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


export async function GET(request: Request) {
    try {
        await connectDB();

        // 1) Decode token from the cookie
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json(
                { error: 'Invalid or missing token' },
                { status: 401 }
            );
        }

        // 2) Find this user in DB
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // 3) Grab the organization from the user doc
        const orgId = currentUser.organization;
        if (!orgId) {
            return NextResponse.json(
                { error: 'User has no organization' },
                { status: 400 }
            );
        }

        // 4) Fetch all members (users) with the same organization and populate role data
        const members = await User.find({ organization: orgId })
            .populate('role')
            .sort({
                createdAt: -1,
            });

        return NextResponse.json(members, { status: 200 });
    } catch (error: any) {
        console.error('Server error in GET /api/members:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}



export async function POST(request: Request) {
    try {
        await connectDB();
        // 1. Get the user ID from the token
        const userId = getDataFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Connect to the database
        await connectDB();

        // 3. Find the user by their ID
        const adminUser = await User.findById(userId).populate('role');
        if (!adminUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        const orgId = adminUser.organization;

        // 4. Get organization details for the email template
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        const data = await request.json();
        const {
            firstName,
            lastName,
            email,
            password,
            roleId,
            whatsappNo,
        } = data;

        if (!firstName || !lastName || !email || !password || !orgId) {
            return NextResponse.json(
                {
                    error:
                        "Missing required fields (firstName, lastName, email, password, orgId)",
                },
                { status: 400 }
            );
        }

        // 5. Create the user in that org
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password,
            organization: orgId,
            role: roleId || null,
            whatsappNo: whatsappNo || "",
            country: "IN", // Add country field for WhatsApp notifications
            isOrgAdmin: false,
        });

        // 6. Send email notification to the new member
        const emailSubject = `Business Workspace Invitation to Team - ${organization.companyName}`;
        const emailHtml = `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="padding: 20px; text-align: center;">
         <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
        </div>
        <div style="padding: 20px;">
          <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1731423673/01_xlguy8.png" alt="Team Illustration" style="max-width: 100%; height: auto;">
          </div>
        <h1 style="font-size: 24px; margin: 0; padding: 10px 20px; color: #000000;">Welcome to Team - ${organization.companyName}</h1>
        <div style="padding: 20px;">
          <p>We are excited to have you on board. Here are your account details:</p>
          <p>Name:<strong> ${firstName} ${lastName}</strong></p>
          <p>Email:<strong> <a href="mailto:${email}" style="color: #1a73e8;">${email}</a></strong></p>
          <p>Password:<strong> ${password}</strong></p>
          <p>WhatsApp Number:<strong> ${whatsappNo}</strong></p>
          <p>Role:<strong> Member</strong></p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #0C874B; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Here</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px;  text-align: center; color: #888888;">This is an automated notification. Please do not reply.</p>
        </div>
      </div>
    </div>
  </body>`;

        const emailOptions: SendEmailOptions = {
            to: email,
            subject: emailSubject,
            text: `Dear ${firstName},\n\nYou've been added to ${organization.companyName}. Your login credentials are: Email: ${email}, Password: ${password}`,
            html: emailHtml,
        };

        await sendEmail(emailOptions);

        // 7. Send WhatsApp notification if phone number and country are provided
        if (whatsappNo) {
            const templateName = 'loginsuccessmember2';
            const bodyVariables = [firstName, adminUser.firstName, organization.companyName, email, password];
            await sendWebhookNotification(whatsappNo, "IN", templateName, bodyVariables);
        }

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error("Error creating member:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}