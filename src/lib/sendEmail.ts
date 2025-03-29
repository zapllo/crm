import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import EmailAccount from '@/models/EmailAccount';
import { SentMessageInfo } from 'nodemailer';

export interface SendEmailOptions {
    to: string;
    cc?: string;
    subject: string;
    text: string;
    html: string;
    userId?: string;
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

            if (emailAccount && emailAccount.accessToken) {
                console.log(`Found connected Google account: ${emailAccount.emailAddress}`);

                // Create OAuth2 client
                const oauth2Client = new google.auth.OAuth2(
                    process.env.GOOGLE_CLIENT_ID,
                    process.env.GOOGLE_CLIENT_SECRET,
                    process.env.NEXT_PUBLIC_APP_URL + '/api/channels/connect/google/callback'
                );

                // Set credentials
                oauth2Client.setCredentials({
                    access_token: emailAccount.accessToken,
                    refresh_token: emailAccount.refreshToken
                });

                // Refresh the token to ensure it's valid
                let accessToken = emailAccount.accessToken;
                try {
                    console.log('Refreshing access token...');
                    const { credentials } = await oauth2Client.refreshAccessToken();
                    
                    accessToken = credentials.access_token;
                    
                    // Update the token in the database
                    await EmailAccount.findByIdAndUpdate(emailAccount._id, {
                        accessToken: credentials.access_token
                    });
                    
                    console.log('Token refreshed successfully');
                } catch (tokenError) {
                    console.error('Error refreshing token:', tokenError);
                    throw new Error('Failed to refresh Google OAuth token');
                }

                // Create Gmail transporter with OAuth2
                transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: emailAccount.emailAddress,
                        clientId: process.env.GOOGLE_CLIENT_ID,
                        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                        refreshToken: emailAccount.refreshToken,
                        accessToken: accessToken
                    }
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
        // Send mail without verify step which can cause issues with Gmail
        await transporter.sendMail(msg);
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}