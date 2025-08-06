import { google } from 'googleapis';
import EmailAccount from '@/models/EmailAccount';
import nodemailer from 'nodemailer';

export interface SendEmailOptions {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    text?: string;
    html: string;
    userId?: string;
    templateData?: Record<string, any>; // For placeholder replacement
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: Buffer | string;
        contentType?: string;
    }>;
}

// Function to replace placeholders in template content
function replacePlaceholders(content: string, data: Record<string, any> = {}): string {
    return content.replace(/{{([^}]+)}}/g, (match, key) => {
        // Split the key by dots to handle nested objects like 'contact.firstName'
        const keys = key.trim().split('.');
        let value = data;

        for (const k of keys) {
            value = value?.[k];
            if (value === undefined || value === null) {
                break;
            }
        }

        // Return the value if found, otherwise return placeholder or empty string
        if (value !== undefined && value !== null) {
            return String(value);
        }

        // For missing data, you can choose to:
        // 1. Keep the placeholder: return match;
        // 2. Return empty string: return '';
        // 3. Return a default message: return `[${key}]`;

        return ''; // Return empty string for missing placeholders
    });
}

// Function to convert HTML to plain text (basic implementation)
function htmlToText(html: string): string {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
        .trim();
}


// Add this function at the top of the file after imports
function processImagesForEmail(html: string): string {
    // Convert relative URLs to absolute URLs if needed
    const processedHtml = html.replace(
        /<img([^>]*?)src=["']([^"']*?)["']([^>]*?)>/gi,
        (match, beforeSrc, src, afterSrc) => {
            // If src is already absolute, keep it
            if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
                return match;
            }

            // If it's a relative URL, make it absolute (adjust based on your setup)
            const absoluteSrc = src.startsWith('/') ? `${process.env.NEXT_PUBLIC_APP_URL}${src}` : src;

            return `<img${beforeSrc}src="${absoluteSrc}"${afterSrc}>`;
        }
    );

    return processedHtml;
}

// Update the enhanceEmailHTML function
function enhanceEmailHTML(html: string, trackingId?: string): string {
    // Process images first
    let processedHtml = processImagesForEmail(html);

    // Add basic email-safe CSS reset and styling
    const emailStyles = `
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; 
      line-height: 1.6; 
      color: #333; 
      background-color: #f7f7f7; 
    }
    .email-container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: white; 
      padding: 30px; 
      border-radius: 8px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    }
    h1, h2, h3 { 
      color: #2563eb; 
      margin-top: 0; 
    }
    p { 
      margin: 16px 0; 
    }
    a { 
      color: #2563eb; 
      text-decoration: none; 
    }
    a:hover { 
      text-decoration: underline; 
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin: 10px 0;
    }
    .button:hover {
      background-color: #1d4ed8;
    }
    
    /* Image specific styles for email clients */
    img {
      max-width: 100% !important;
      height: auto !important;
      display: block;
      border-radius: 8px;
      margin: 16px auto;
    }
    
    /* Outlook specific */
    table img {
      display: inline-block;
    }
    
    /* Gmail specific */
    .gmail-blend-screen { background-color: #fff; }
    .gmail-blend-difference { background-color: #fff; }
    
    /* Image containers */
    div[style*="text-align: center"] img {
      margin: 16px auto;
      display: block;
    }
    
    /* Responsive images */
    @media only screen and (max-width: 600px) {
      img {
        max-width: 100% !important;
        width: auto !important;
        height: auto !important;
      }
    }
  </style>`;

    // Check if HTML already has basic structure
    const hasHtmlStructure = processedHtml.includes('<html') || processedHtml.includes('<head') || processedHtml.includes('<body');

    let enhancedHTML;

    if (hasHtmlStructure) {
        // If it already has HTML structure, just inject styles into head
        enhancedHTML = processedHtml.replace(
            /<head[^>]*>/i,
            `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${emailStyles}`
        );
    } else {
        // Wrap content in proper email structure
        enhancedHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>Email</title>
        ${emailStyles}
    </head>
    <body>
        <div class="email-container">
            ${processedHtml}
            </div>
        ${trackingId ? `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/email/track/${trackingId}" width="1" height="1" style="display:none;" alt="">` : ''}
    </body>
    </html>`;
    }

    return enhancedHTML;
}


export async function sendEmail({
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    userId,
    templateData = {},
    attachments = []
}: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        // Replace placeholders in subject and content
        const processedSubject = replacePlaceholders(subject, templateData);
        const processedHTML = replacePlaceholders(html, templateData);
        const processedText = text ? replacePlaceholders(text, templateData) : htmlToText(processedHTML);

        // Enhance HTML for better email client compatibility AND image handling
        const enhancedHTML = enhanceEmailHTML(processedHTML);

        console.log('Sending email with enhanced HTML:', enhancedHTML.substring(0, 200) + '...');

        // If userId is provided, attempt to find their connected Google account
        if (userId) {
            try {
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
                        if (credentials.access_token) {
                            await EmailAccount.findByIdAndUpdate(emailAccount._id, {
                                accessToken: credentials.access_token
                            });
                        }

                        console.log('Token refreshed successfully');

                        // Use Gmail API directly
                        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

                        // Prepare multipart email content (RFC 2822 format)
                        const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                        const emailLines = [
                            `From: ${emailAccount.emailAddress}`,
                            `To: ${to}`,
                        ];

                        if (cc) emailLines.push(`Cc: ${cc}`);
                        if (bcc) emailLines.push(`Bcc: ${bcc}`);

                        emailLines.push(
                            `Subject: ${processedSubject}`,
                            'MIME-Version: 1.0',
                            `Content-Type: multipart/alternative; boundary="${boundary}"`,
                            '',
                            `--${boundary}`,
                            'Content-Type: text/plain; charset=utf-8',
                            'Content-Transfer-Encoding: quoted-printable',
                            '',
                            processedText,
                            '',
                            `--${boundary}`,
                            'Content-Type: text/html; charset=utf-8',
                            'Content-Transfer-Encoding: quoted-printable',
                            '',
                            enhancedHTML,
                            ''
                        );

                        // Add attachments if any
                        if (attachments.length > 0) {
                            for (const attachment of attachments) {
                                emailLines.push(
                                    `--${boundary}`,
                                    `Content-Type: ${attachment.contentType || 'application/octet-stream'}`,
                                    `Content-Disposition: attachment; filename="${attachment.filename}"`,
                                    'Content-Transfer-Encoding: base64',
                                    '',
                                );

                                if (attachment.content) {
                                    const base64Content = Buffer.isBuffer(attachment.content)
                                        ? attachment.content.toString('base64')
                                        : Buffer.from(attachment.content).toString('base64');
                                    emailLines.push(base64Content, '');
                                }
                            }
                        }

                        emailLines.push(`--${boundary}--`);

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
                        return {
                            success: true,
                            messageId: res.data.id || undefined
                        };

                    } catch (error) {
                        console.error('Error using Gmail API:', error);
                        // Fall through to SMTP fallback
                    }
                }
            } catch (error) {
                console.error('Error getting user email account:', error);
                // Fall through to SMTP fallback
            }
        }

        // Fallback to standard SMTP
        console.log('Using SMTP fallback...');

        // Validate SMTP configuration
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP configuration is incomplete. Please check your environment variables.');
            return {
                success: false,
                error: 'SMTP configuration is incomplete'
            };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false // For development only
            }
        });

        const msg = {
            from: `"${process.env.SMTP_FROM_NAME || 'Zapllo CRM'}" <${process.env.SMTP_USER}>`,
            to,
            cc,
            bcc,
            subject: processedSubject,
            text: processedText,
            html: enhancedHTML, // Use enhanced HTML with proper image handling
            attachments: attachments.map(att => ({
                filename: att.filename,
                path: att.path,
                content: att.content,
                contentType: att.contentType
            }))
        };

        const info = await transporter.sendMail(msg);
        console.log('Message sent successfully via SMTP:', info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };

    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}



// Utility function to validate email template before sending
export function validateEmailTemplate(template: { subject: string; body: string; }): {
    isValid: boolean;
    errors: string[]
} {
    const errors: string[] = [];

    if (!template.subject.trim()) {
        errors.push('Subject is required');
    }

    if (!template.body.trim()) {
        errors.push('Email body is required');
    }

    // Check for unclosed placeholders
    const unclosedPlaceholders = template.body.match(/{{[^}]*$/g);
    if (unclosedPlaceholders) {
        errors.push('Email contains unclosed placeholders');
    }

    // Check for orphaned closing brackets
    const orphanedBrackets = template.body.match(/^[^{]*}}/g);
    if (orphanedBrackets) {
        errors.push('Email contains orphaned closing brackets');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Utility function to preview email with sample data
export function previewEmailTemplate(
    template: { subject: string; body: string; },
    sampleData: Record<string, any> = {}
): { subject: string; html: string; text: string } {
    const processedSubject = replacePlaceholders(template.subject, sampleData);
    const processedHTML = replacePlaceholders(template.body, sampleData);
    const enhancedHTML = enhanceEmailHTML(processedHTML);
    const processedText = htmlToText(processedHTML);

    return {
        subject: processedSubject,
        html: enhancedHTML,
        text: processedText
    };
}