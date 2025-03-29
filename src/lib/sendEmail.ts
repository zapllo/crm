import nodemailer from 'nodemailer';
import EmailAccount from '@/models/EmailAccount'; // Add this import
import { getDataFromToken } from '@/lib/getDataFromToken'; // Add this import

export interface SendEmailOptions {
    to: string;
    cc?: string; // Optional cc field
    subject: string;
    text: string;
    html: string;
    userId?: string; // Add userId parameter to find the user's connected account
}

export async function sendEmail({ to, cc, subject, text, html, userId }: SendEmailOptions): Promise<void> {
    let transporter;
    let fromAddress = process.env.SMTP_USER || 'notifications@zapllo.com';

    // If userId is provided, attempt to find their connected Google account
    if (userId) {
        try {
            // Get user's connected Gmail account if available
            const emailAccount = await EmailAccount.findOne({ 
                userId, 
                provider: 'google' 
            });

            if (emailAccount) {
                // Set up OAuth2 transporter for Gmail
                transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: emailAccount.emailAddress,
                        clientId: process.env.GOOGLE_CLIENT_ID,
                        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                        refreshToken: emailAccount.refreshToken,
                        accessToken: emailAccount.accessToken,
                    },
                });
                
                // Update the from address to use the user's Gmail
                fromAddress = emailAccount.emailAddress;
                console.log(`Using connected Gmail account: ${fromAddress}`);
            }
        } catch (error) {
            console.error('Error getting user email account:', error);
            // Will fall back to default transporter
        }
    }

    // If no user-specific transporter was created, use default SMTP
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'notifications@example.com',
                pass: process.env.SMTP_PASS || 'your-email-password',
            },
        });
        console.log('Using default SMTP configuration');
    }

    const msg = {
        from: fromAddress,
        to,
        cc,
        subject,
        text,
        html,
    };

    try {
        await transporter.sendMail(msg);
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; // Re-throw to allow handling by caller
    }
}