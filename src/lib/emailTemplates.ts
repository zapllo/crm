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