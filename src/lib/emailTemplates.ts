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
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Lead Assigned</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f5f7fa;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 560px;
                margin: 20px auto;
                padding: 24px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 3px 16px rgba(0, 0, 0, 0.06);
            }
            .header {
                text-align: center;
                padding: 18px 0;
                margin: -24px -24px 16px -24px;
                border-radius: 10px 10px 0 0;
               background: linear-gradient(90deg, #7451F8, #F57E57);
                border-bottom: 1px solid rgba(128, 93, 244, 0.3);
            }
            .logo {
                max-width: 130px;
                height: auto;
                margin: 0 auto;
            }
            .title {
                color: #805DF4;
                font-size: 22px;
                font-weight: 600;
                margin: 24px 0 4px;
                text-align: center;
            }
            .subtitle {
                color: #5d6778;
                font-size: 14px;
                text-align: center;
                margin-bottom: 24px;
            }
            .greeting {
                font-size: 16px;
                font-weight: 500;
                color: #1a2b3c;
            }
            .content {
                padding: 0;
            }
            .lead-details {
                background-color: #f8faff;
                padding: 16px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 3px solid #805DF4;
            }
            .detail-item {
                margin-bottom: 12px;
                display: flex;
                align-items: center;
            }
            .detail-item:last-child {
                margin-bottom: 0;
            }
            .label {
                font-weight: 500;
                color: #5d6778;
                width: 110px;
                font-size: 13px;
            }
            .value {
                color: #1D193F;
                font-size: 14px;
                font-weight: 500;
                flex: 1;
            }
            .cta-container {
                text-align: center;
                margin: 24px 0;
            }
            .cta-button {
                display: inline-block;
                background-image: linear-gradient(to right, #805DF4, #5F41E5);
                color: white !important;
                text-decoration: none;
                padding: 10px 24px;
                border-radius: 6px;
                font-weight: 500;
                font-size: 14px;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(128, 93, 244, 0.25);
            }
            .cta-button:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(128, 93, 244, 0.3);
            }
            .tip-container {
                background-color: rgba(128, 93, 244, 0.07);
                border-radius: 6px;
                padding: 12px 16px;
                margin: 20px 0;
                border-left: 3px solid #805DF4;
                font-size: 13px;
            }
            .tip-title {
                color: #805DF4;
                font-weight: 600;
                margin-bottom: 4px;
                display: flex;
                align-items: center;
                font-size: 13px;
            }
            .tip-title::before {
                content: "💡";
                margin-right: 6px;
            }
            .footer {
                text-align: center;
                color: #9da3af;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 16px;
                border-top: 1px solid #eee;
            }
            .social-links {
                display: flex;
                justify-content: center;
                margin: 12px 0;
            }
            .social-link {
                display: inline-block;
                margin: 0 8px;
                color: #805DF4;
                font-size: 12px;
                text-decoration: none;
            }
            p {
                margin: 12px 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.zapllo.com/logo.png" alt="Zapllo Logo" class="logo">
            </div>
            
            <div class="title">New Lead Assigned</div>
            <div class="subtitle">A new opportunity is waiting for you</div>
            
            <div class="content">
                <p class="greeting">Hi ${firstName},</p>
                <p>A new lead has just been assigned to you in Zapllo CRM. Here are the details:</p>
                
                <div class="lead-details">
                    <div class="detail-item">
                        <span class="label">Lead title</span>
                        <span class="value">${leadDetails.title}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Contact name</span>
                        <span class="value">${leadDetails.contactName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Contact number</span>
                        <span class="value">${leadDetails.contactNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Source</span>
                        <span class="value">${leadDetails.sourceName}</span>
                    </div>
                </div>
                
                <div class="cta-container">
                    <a href="https://crm.zapllo.com/CRM/leads/${leadDetails.leadId}" class="cta-button">View Lead Details</a>
                </div>
                
                <div class="tip-container">
                    <div class="tip-title">Pro Tip</div>
                    <p style="margin: 0; font-size: 13px;">Reaching out within the first hour can increase your conversion rate significantly. Seize this opportunity!</p>
                </div>
                
                <p>Best regards,<br>The Zapllo Team</p>
            </div>
            
            <div class="footer">
               
                <p style="margin: 8px 0; font-size: 12px;">© 2025 Zapllo. All rights reserved.</p>
                        <p style="margin: 8px 0; font-size: 12px;">This is an automated notification. Please do not reply</p>
            </div>
        </div>
    </body>
    </html>
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
    const followupRows = pendingFollowups.map((followup, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#f8faff' : '#ffffff'}">
        <td style="padding: 12px; border-bottom: 1px solid #eaedf2;">${followup.leadTitle}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaedf2;">${followup.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaedf2;">${followup.type}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eaedf2;">${new Date(followup.followupDate).toLocaleDateString()}</td>
      </tr>
    `).join('');
  
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Daily Lead Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 560px;
            margin: 20px auto;
            padding: 24px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 3px 16px rgba(0, 0, 0, 0.06);
          }
          .header {
            text-align: center;
            padding: 18px 0;
            margin: -24px -24px 16px -24px;
            border-radius: 10px 10px 0 0;
            background: linear-gradient(90deg, #7451F8, #F57E57);
            border-bottom: 1px solid rgba(128, 93, 244, 0.3);
          }
          .logo {
            max-width: 130px;
            height: auto;
            margin: 0 auto;
          }
          .title {
            color: #805DF4;
            font-size: 22px;
            font-weight: 600;
            margin: 24px 0 4px;
            text-align: center;
          }
          .subtitle {
            color: #5d6778;
            font-size: 14px;
            text-align: center;
            margin-bottom: 24px;
          }
          .greeting {
            font-size: 16px;
            font-weight: 500;
            color: #1a2b3c;
          }
          .content {
            padding: 0;
          }
          .date {
            color: #5d6778;
            font-size: 14px;
            text-align: center;
            margin-bottom: 24px;
            font-style: italic;
          }
          .stat-cards {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin: 24px 0;
          }
          .stat-card {
            flex: 1;
            min-width: 100px;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.07);
            background-color: #ffffff;
            border-left: 3px solid;
          }
          .card-title {
            font-size: 13px;
            color: #5d6778;
            margin-bottom: 6px;
            font-weight: 500;
          }
          .card-value {
            font-size: 24px;
            font-weight: 600;
            color: #1D193F;
          }
          .total { border-color: #805DF4; }
          .open { border-color: #FFB547; }
          .won { border-color: #28C76F; }
          .lost { border-color: #EA5455; }
          
          .follow-ups-container {
            background-color: #f8faff;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
            border-left: 3px solid #805DF4;
          }
          
          .follow-ups-title {
            color: #805DF4;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 16px;
            display: flex;
            align-items: center;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          
          th {
            background-color: rgba(128, 93, 244, 0.07);
            color: #5d6778;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #eaedf2;
          }
          
          td {
            padding: 12px;
            border-bottom: 1px solid #eaedf2;
            color: #1D193F;
          }
          
          .cta-container {
            text-align: center;
            margin: 24px 0;
          }
          
          .cta-button {
            display: inline-block;
            background-image: linear-gradient(to right, #805DF4, #5F41E5);
            color: white !important;
            text-decoration: none;
            padding: 10px 24px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 8px rgba(128, 93, 244, 0.25);
          }
          
          .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(128, 93, 244, 0.3);
          }
          
          .footer {
            text-align: center;
            color: #9da3af;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 16px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://www.zapllo.com/logo.png" alt="Zapllo Logo" class="logo">
          </div>
          
          <div class="title">Your Daily Lead Report</div>
          <div class="subtitle">Performance summary and pending follow-ups</div>
          
          <div class="content">
            <p class="greeting">Hi ${firstName},</p>
            <p>Here's your daily lead activity report for ${formattedDate}:</p>
            
            <div class="stat-cards">
              <div class="stat-card total">
                <div class="card-title">TOTAL LEADS</div>
                <div class="card-value">${totalLeads}</div>
              </div>
              <div class="stat-card open">
                <div class="card-title">OPEN LEADS</div>
                <div class="card-value">${openLeads}</div>
              </div>
              <div class="stat-card won">
                <div class="card-title">WON LEADS</div>
                <div class="card-value">${wonLeads}</div>
              </div>
              <div class="stat-card lost">
                <div class="card-title">LOST LEADS</div>
                <div class="card-value">${lostLeads}</div>
              </div>
            </div>
            
            <div class="follow-ups-container">
              <div class="follow-ups-title">📋 Pending Follow-ups (${pendingFollowups.length})</div>
              
              ${pendingFollowups.length > 0 ? `
                <table>
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${followupRows}
                  </tbody>
                </table>
              ` : '<p style="margin: 0; font-size: 14px;">No pending follow-ups for today!</p>'}
            </div>
            
            <div class="cta-container">
              <a href="https://crm.zapllo.com/CRM/dashboard" class="cta-button">Go to Dashboard</a>
            </div>
            
            <p>Stay productive and keep closing those deals!</p>
            <p>Best regards,<br>The Zapllo Team</p>
          </div>
          
          <div class="footer">
            <p style="margin: 8px 0; font-size: 12px;">This is an automated notification. Please do not reply.</p>
            <p style="margin: 8px 0; font-size: 12px;">© 2025 Zapllo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  
    await sendEmail({
      to,
      text: `Zapllo CRM Daily Report for ${formattedDate}`,
      subject: `CRM Daily Report - ${formattedDate}`,
      html: emailContent,
    });
  }