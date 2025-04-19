import { sendEmail } from './sendEmail';

interface LeadAssignmentEmailProps {
    to: string;
    firstName: string;
    leadDetails: {
        title: string;
        contactName: string;
        contactNumber: string;
        sourceName: string;
        leadId: string;
    };
}

export async function sendLeadAssignmentEmail({
    to,
    firstName,
    leadDetails
}: LeadAssignmentEmailProps): Promise<void> {
    const subject = `🚀 New Lead Assigned: ${leadDetails.title}`;

    const html = `
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="background-color: #f0f4f8; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="padding: 20px; text-align: center;">
                    <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
                </div>
                <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
                    <h1 style="margin: 0; font-size: 20px;">New Lead Assigned</h1>
                </div>
                <div style="padding: 20px;">
                    <p><strong>Dear ${firstName},</strong></p>
                    <p>A new lead has been assigned to your account in the CRM system.</p>
                    <div style="border-radius:8px; margin-top:4px; color:#000000; padding:10px; background-color:#ECF1F6">
                        <p><strong>Title:</strong> ${leadDetails.title}</p>
                        <p><strong>Contact Name:</strong> ${leadDetails.contactName}</p>
                        <p><strong>Contact Number:</strong> ${leadDetails.contactNumber}</p>
                        <p><strong>Source:</strong> ${leadDetails.sourceName}</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://crm.zapllo.com/CRM/leads/${leadDetails.leadId}" style="background-color: #0C874B; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Lead Details</a>
                    </div>
                    <p style="margin-top: 20px; text-align: center; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                </div>
            </div>
        </div>
    </body>
    `;

    const text = `
    Hi ${firstName},

    A new lead has just been assigned to you in Zapllo CRM.

    Lead Title: ${leadDetails.title}
    Contact Name: ${leadDetails.contactName}
    Contact Number: ${leadDetails.contactNumber}
    Source: ${leadDetails.sourceName}

    Visit https://crm.zapllo.com/CRM/leads/${leadDetails.leadId} to view the lead details.

    Pro Tip: Reaching out within the first hour can increase your conversion rate significantly!

    Best regards,
    The Zapllo Team
    `;

    await sendEmail({
        to,
        subject,
        text,
        html
    });
}




interface DailyReportEmailProps {
    to: string;
    firstName: string;
    reportData: {
        totalLeads: number;
        openLeads: number;
        wonLeads: number;
        lostLeads: number;
        pendingFollowups: {
            description: string;
            type: string;
            followupDate: Date;
            leadTitle: string;
        }[];
    };
}

export async function sendDailyReportEmail({
    to,
    firstName,
    reportData
}: DailyReportEmailProps) {
    const { totalLeads, openLeads, wonLeads, lostLeads, pendingFollowups } = reportData;

    // Format the date for the report
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Generate table rows for followups
    const followupRows = pendingFollowups.map(followup => `
        <p><strong>Lead:</strong> ${followup.leadTitle}</p>
        <p><strong>Description:</strong> ${followup.description}</p>
        <p><strong>Type:</strong> ${followup.type}</p>
        <p><strong>Date:</strong> ${new Date(followup.followupDate).toLocaleDateString()}</p>
        <hr style="border-top: 1px solid #eaedf2; margin: 10px 0;">
    `).join('');

    const html = `
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="background-color: #f0f4f8; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="padding: 20px; text-align: center;">
                    <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
                </div>
                <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
                    <h1 style="margin: 0; font-size: 20px;">Your Daily CRM Report</h1>
                </div>
                <div style="padding: 20px;">
                    <p><strong>Dear ${firstName},</strong></p>
                    <p>Here's your daily CRM activity report for ${formattedDate}:</p>

                    <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
                        <div style="flex: 1; min-width: 120px; padding: 15px; border-radius: 8px; text-align: center; background-color:#ECF1F6; border-left: 3px solid #7451F8;">
                            <div style="font-size: 13px; color: #5d6778; margin-bottom: 5px;">TOTAL LEADS</div>
                            <div style="font-size: 22px; font-weight: bold; color: #1D193F;">${totalLeads}</div>
                        </div>
                        <div style="flex: 1; min-width: 120px; padding: 15px; border-radius: 8px; text-align: center; background-color:#ECF1F6; border-left: 3px solid #FFB547;">
                            <div style="font-size: 13px; color: #5d6778; margin-bottom: 5px;">OPEN LEADS</div>
                            <div style="font-size: 22px; font-weight: bold; color: #1D193F;">${openLeads}</div>
                        </div>
                        <div style="flex: 1; min-width: 120px; padding: 15px; border-radius: 8px; text-align: center; background-color:#ECF1F6; border-left: 3px solid #28C76F;">
                            <div style="font-size: 13px; color: #5d6778; margin-bottom: 5px;">WON LEADS</div>
                            <div style="font-size: 22px; font-weight: bold; color: #1D193F;">${wonLeads}</div>
                        </div>
                        <div style="flex: 1; min-width: 120px; padding: 15px; border-radius: 8px; text-align: center; background-color:#ECF1F6; border-left: 3px solid #EA5455;">
                            <div style="font-size: 13px; color: #5d6778; margin-bottom: 5px;">LOST LEADS</div>
                            <div style="font-size: 22px; font-weight: bold; color: #1D193F;">${lostLeads}</div>
                        </div>
                    </div>

                    <p><strong>Pending Follow-ups (${pendingFollowups.length}):</strong></p>
                    <div style="border-radius:8px; margin-top:4px; color:#000000; padding:10px; background-color:#ECF1F6">
                        ${pendingFollowups.length > 0 ? followupRows : "<p>No pending follow-ups for today!</p>"}
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://crm.zapllo.com/CRM/dashboard" style="background-color: #0C874B; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    </div>
                    <p style="margin-top: 20px; text-align: center; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                </div>
            </div>
        </div>
    </body>
    `;

    await sendEmail({
        to,
        text: `Zapllo CRM Daily Report for ${formattedDate}`,
        subject: `CRM Daily Report - ${formattedDate}`,
        html: html,
    });
}

// Add this to your existing emailTemplates.ts file

interface QuotationEmailProps {
    to: string;
    subject: string;
    message: string;
    firstName: string;
    quotationDetails: {
        quotationNumber: string;
        title: string;
        total: number;
        currency: string;
        validUntil: string;
        senderName: string;
        publicAccessToken: string;
    };
    userId?: string;
}

export async function sendQuotationEmail({
    to,
    subject,
    message,
    firstName,
    quotationDetails,
    userId
}: QuotationEmailProps): Promise<void> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://crm.zapllo.com';
    const quotationUrl = `${appUrl}/share/quotation/${quotationDetails.publicAccessToken}`;

    // Format currency
    const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: quotationDetails.currency || 'USD',
    }).format(quotationDetails.total);

    // Format valid until date
    const validUntil = new Date(quotationDetails.validUntil).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const html = `
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="background-color: #f0f4f8; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="padding: 20px; text-align: center;">
                    <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
                </div>
                <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
                    <h1 style="margin: 0; font-size: 20px;">Quotation for Your Review</h1>
                </div>
                <div style="padding: 20px;">
                    <p><strong>Dear ${firstName},</strong></p>

                    ${message ? `<p>${message.replace(/\n/g, '<br>')}</p>` : `
                    <p>Please find attached our quotation for your review. We look forward to working with you.</p>
                    `}

                    <div style="border-radius:8px; margin-top:16px; color:#000000; padding:16px; background-color:#ECF1F6">
                        <p><strong>Quotation Number:</strong> ${quotationDetails.quotationNumber}</p>
                        <p><strong>Title:</strong> ${quotationDetails.title}</p>
                        <p><strong>Total Amount:</strong> ${formattedTotal}</p>
                        <p><strong>Valid Until:</strong> ${validUntil}</p>
                    </div>

                    <div style="text-align: center; margin-top: 24px;">
                        <a href="${quotationUrl}" style="background-color: #0C874B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Quotation</a>
                    </div>

                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e6e8eb;">
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                        <p>Best regards,<br>${quotationDetails.senderName}</p>
                    </div>

                    <p style="margin-top: 24px; text-align: center; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                </div>
            </div>
        </div>
    </body>
    `;

    const text = `
    Dear ${firstName},

    ${message || "Please find attached our quotation for your review. We look forward to working with you."}

    QUOTATION DETAILS:
    Quotation Number: ${quotationDetails.quotationNumber}
    Title: ${quotationDetails.title}
    Total Amount: ${formattedTotal}
    Valid Until: ${validUntil}

    To view the quotation, please visit:
    ${quotationUrl}

    If you have any questions, please don't hesitate to contact us.

    Best regards,
    ${quotationDetails.senderName}

    ---
    This is an automated notification. Please do not reply.
    `;

    await sendEmail({
        to,
        subject,
        text,
        html,
        userId
    });
}

// ... existing code ...

interface FollowupReminderEmailProps {
    to: string;
    firstName: string;
    followupDetails: {
        description: string;
        type: string;
        followupDate: Date;
        leadTitle: string;
        contactName: string;
        leadId: string;
    };
}

export async function sendFollowupReminderEmail({
    to,
    firstName,
    followupDetails
}: FollowupReminderEmailProps): Promise<void> {
    const subject = `⏰ Follow-up Reminder: ${followupDetails.leadTitle}`;

    // Format the date for display
    const formattedDate = new Date(followupDetails.followupDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const html = `
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="background-color: #f0f4f8; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="padding: 20px; text-align: center;">
                    <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
                </div>
                <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
                    <h1 style="margin: 0; font-size: 20px;">Follow-up Reminder</h1>
                </div>
                <div style="padding: 20px;">
                    <p><strong>Hello ${firstName},</strong></p>
                    <p>This is a reminder about your scheduled follow-up:</p>
                    <div style="border-radius:8px; margin-top:4px; color:#000000; padding:10px; background-color:#ECF1F6">
                        <p><strong>Lead:</strong> ${followupDetails.leadTitle}</p>
                        <p><strong>Client Name:</strong> ${followupDetails.contactName}</p>
                        <p><strong>Type:</strong> ${followupDetails.type}</p>
                        <p><strong>Description:</strong> ${followupDetails.description}</p>
                        <p><strong>Due Date:</strong> ${formattedDate}</p>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://crm.zapllo.com/CRM/leads/${followupDetails.leadId}" style="background-color: #0C874B; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Lead Details</a>
                    </div>
                    <p style="margin-top: 20px; text-align: center; font-size: 12px; color: #888888;">Please ensure timely follow-up with the lead and update their status on the application accordingly. This is an automated notification. Please do not reply.</p>
                </div>
            </div>
        </div>
    </body>
    `;

    const text = `
    Hello ${firstName},

    ⏰ Here is the Follow-up Reminder for you

    💰 Lead: ${followupDetails.leadTitle}
    👤 Client Name: ${followupDetails.contactName}
    📝 Type: ${followupDetails.type}
    📄 Description: ${followupDetails.description}
    📆 Due Date: ${formattedDate}

    Please ensure timely follow-up with the lead and update their status on the application accordingly.

    View Lead: https://crm.zapllo.com/CRM/leads/${followupDetails.leadId}

    This is an automated notification generated by zapllo.com
    `;

    await sendEmail({
        to,
        subject,
        text,
        html
    });
}


// Add this new interface and function for support ticket emails
interface TicketCreationEmailProps {
    to: string;
    firstName: string;
    ticketDetails: {
        ticketId: string;
        subject: string;
        category: string;
        priority: string;
        message: string;
    };
}

export async function sendTicketCreationEmail({
    to,
    firstName,
    ticketDetails
}: TicketCreationEmailProps): Promise<void> {
    const subject = `🎫 Support Ticket Created: ${ticketDetails.subject}`;

    const priorityColor = {
        high: '#EA5455',
        medium: '#FFB547',
        low: '#28C76F'
    }[ticketDetails.priority.toLowerCase()] || '#7451F8';

    const html = `
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="background-color: #f0f4f8; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="padding: 20px; text-align: center;">
                    <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
                </div>
                <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
                    <h1 style="margin: 0; font-size: 20px;">Support Ticket Received</h1>
                </div>
                <div style="padding: 20px;">
                    <p><strong>Dear ${firstName},</strong></p>
                    <p>Thank you for submitting your support ticket. Our team has received your request and will respond as soon as possible.</p>
                    <div style="border-radius:8px; margin-top:4px; color:#000000; padding:10px; background-color:#ECF1F6">
                        <p><strong>Ticket ID:</strong> ${ticketDetails.ticketId}</p>
                        <p><strong>Subject:</strong> ${ticketDetails.subject}</p>
                        <p><strong>Category:</strong> ${ticketDetails.category}</p>
                        <p><strong>Priority:</strong> <span style="color: ${priorityColor}; font-weight: bold;">${ticketDetails.priority}</span></p>
                        <p><strong>Message:</strong></p>
                        <div style="background-color: #ffffff; padding: 10px; border-radius: 4px; margin-top: 5px;">
                            ${ticketDetails.message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://crm.zapllo.com/help/tickets" style="background-color: #0C874B; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket Status</a>
                    </div>
                    <p style="margin-top: 20px;">
                        We'll update you as soon as there are developments with your ticket. You can also check the status of your ticket by logging into your account.
                    </p>
                    <p style="margin-top: 20px; text-align: center; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                </div>
            </div>
        </div>
    </body>
    `;

    const text = `
    Dear ${firstName},

    Thank you for submitting your support ticket. Our team has received your request and will respond as soon as possible.

    TICKET DETAILS:
    Ticket ID: ${ticketDetails.ticketId}
    Subject: ${ticketDetails.subject}
    Category: ${ticketDetails.category}
    Priority: ${ticketDetails.priority}

    Message:
    ${ticketDetails.message}

    You can check the status of your ticket by visiting:
    https://crm.zapllo.com/help/tickets

    We'll update you as soon as there are developments with your ticket.

    Best regards,
    The Zapllo Support Team

    ---
    This is an automated notification. Please do not reply.
    `;

    await sendEmail({
        to,
        subject,
        text,
        html
    });
}


// ... existing code ...

interface FormShareEmailProps {
    to: string;
    subject: string;
    firstName: string;
    formDetails: {
        formName: string;
        message?: string;
        senderName: string;
        formUrl: string;
    };
}

export async function sendFormShareEmail({
    to,
    subject,
    firstName,
    formDetails
}: FormShareEmailProps): Promise<void> {
    const html = `
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="background-color: #f0f4f8; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="padding: 20px; text-align: center;">
                    <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
                </div>
                <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
                    <h1 style="margin: 0; font-size: 20px;">Form Shared With You</h1>
                </div>
                <div style="padding: 20px;">
                    <p><strong>Dear ${firstName},</strong></p>

                    ${formDetails.message ? `<p>${formDetails.message.replace(/\n/g, '<br>')}</p>` : `
                    <p>A form has been shared with you. Please click the button below to access the form.</p>
                    `}

                    <div style="border-radius:8px; margin-top:16px; color:#000000; padding:16px; background-color:#ECF1F6">
                        <p><strong>Form:</strong> ${formDetails.formName}</p>
                    </div>

                    <div style="text-align: center; margin-top: 24px;">
                        <a href="${formDetails.formUrl}" style="background-color: #0C874B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Access Form</a>
                    </div>

                    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e6e8eb;">
                        <p>If you have any questions, please don't hesitate to contact us.</p>
                        <p>Best regards,<br>${formDetails.senderName}</p>
                    </div>

                    <p style="margin-top: 24px; text-align: center; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                </div>
            </div>
        </div>
    </body>
    `;

    const text = `
    Dear ${firstName},

    ${formDetails.message || "A form has been shared with you. Please access the form using the link below."}

    FORM DETAILS:
    Form Name: ${formDetails.formName}

    To access the form, please visit:
    ${formDetails.formUrl}

    If you have any questions, please don't hesitate to contact us.

    Best regards,
    ${formDetails.senderName}

    ---
    This is an automated notification. Please do not reply.
    `;

    await sendEmail({
        to,
        subject,
        text,
        html
    });
}
