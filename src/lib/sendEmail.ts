import { google } from 'googleapis';
import EmailAccount from '@/models/EmailAccount';
import nodemailer from 'nodemailer';

export interface SendEmailOptions {
    to: string;
    cc?: string;
    subject: string;
    text: string;
    html: string;
    userId?: string;
}

export async function sendEmail({ to, cc, subject, text, html, userId }: SendEmailOptions): Promise<void> {
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
                
                try {
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
                    console.log('Refreshing access token...');
                    const { credentials } = await oauth2Client.refreshAccessToken();
                    
                    // Update the token in the database
                    await EmailAccount.findByIdAndUpdate(emailAccount._id, {
                        accessToken: credentials.access_token
                    });
                    
                    console.log('Token refreshed successfully');
                    
                    // Use Gmail API directly instead of SMTP
                    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
                    
                    // Prepare email content (RFC 2822 format)
                    const emailLines = [
                        `From: ${emailAccount.emailAddress}`,
                        `To: ${to}`,
                    ];
                    
                    if (cc) {
                        emailLines.push(`Cc: ${cc}`);
                    }
                    
                    emailLines.push(
                        `Subject: ${subject}`,
                        'MIME-Version: 1.0',
                        'Content-Type: text/html; charset=utf-8',
                        '',
                        html
                    );
                    
                    // Encode the email
                    const encodedMessage = Buffer.from(emailLines.join('\r\n'))
                        .toString('base64')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=+$/, '');
                    
                    // Send email using Gmail API
                    const res = await gmail.users.messages.send({
                        userId: 'me',
                        requestBody: {
                            raw: encodedMessage
                        }
                    });
                    
                    console.log('Email sent successfully using Gmail API', res.data);
                    return;
                    
                } catch (error) {
                    console.error('Error using Gmail API:', error);
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error getting user email account:', error);
            // Will fall back to default transporter
        }
    }

    // Fallback to standard SMTP if the Gmail API approach fails or user has no connected account
    try {
        // Create standard SMTP transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER || 'notifications@example.com',
                pass: process.env.SMTP_PASS || 'your-email-password',
            },
        });
        
        console.log('Using default SMTP configuration');
        
        const msg = {
            from: process.env.SMTP_USER || 'notifications@zapllo.com',
            to,
            cc,
            subject,
            text,
            html,
        };
        
        // Send mail
        await transporter.sendMail(msg);
        console.log('Message sent successfully via SMTP');
        return;
    } catch (error) {
        console.error('Error sending email via SMTP:', error);
        throw error;
    }
}