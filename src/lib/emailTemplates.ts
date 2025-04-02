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
                background-color: #f0f4f8;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 0;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px;
            }
            .logo {
                max-width: 150px;
                height: auto;
            }
            .banner {
                background: linear-gradient(90deg, #7451F8, #F57E57);
                color: #ffffff;
                padding: 20px 40px;
                font-size: 16px;
                font-weight: bold;
                text-align: center;
                border-radius: 12px;
                margin: 0 auto 20px;
                max-width: 80%;
            }
            .banner h1 {
                margin: 0;
                font-size: 20px;
            }
            .content {
                padding: 20px;
                text-align: left;
            }
            .lead-details {
                background-color: #f8faff;
                padding: 16px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 3px solid #7451F8;
            }
            .detail-row {
                margin-bottom: 10px;
            }
            .detail-label {
                font-weight: 500;
                color: #5d6778;
                font-size: 14px;
            }
            .detail-value {
                color: #1D193F;
                font-size: 14px;
                font-weight: 500;
            }
            .cta-container {
                text-align: center;
                margin: 30px 0;
            }
            .cta-button {
                background-color: #0C874B;
                color: #ffffff;
                padding: 12px 24px;
                font-size: 16px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .tip-container {
                background-color: #f8faff;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                border-left: 3px solid #7451F8;
            }
            .tip-title {
                color: #7451F8;
                font-weight: 600;
                margin-bottom: 10px;
                font-size: 14px;
            }
            .footer {
                padding: 20px;
                font-size: 12px;
                color: #888888;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" class="logo">
            </div>
            
            <div class="banner">
                <h1>New Lead Assigned</h1>
            </div>
            
            <div class="content">
                <p>Dear <strong>${firstName},</strong></p>
                <p>A new lead has been assigned to your account in the CRM system.</p>
                
                <div class="lead-details">
                    <div class="detail-row">
                        <div class="detail-label">Lead Title:</div>
                        <div class="detail-value">${leadDetails.title}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Contact Name:</div>
                        <div class="detail-value">${leadDetails.contactName}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Contact Number:</div>
                        <div class="detail-value">${leadDetails.contactNumber}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Source:</div>
                        <div class="detail-value">${leadDetails.sourceName}</div>
                    </div>
                </div>
                
                <p>Please review this lead and take appropriate action to boost your conversion rates.</p>
                
                <div class="cta-container">
                    <a href="https://crm.zapllo.com/CRM/leads/${leadDetails.leadId}" class="cta-button">View Lead Details</a>
                </div>
                
                <div class="tip-container">
                    <div class="tip-title">💡 Pro Tip</div>
                    <p>Responding to new leads within the first hour can increase your chances of conversion by up to 7x!</p>
                </div>
                
                <p>If you have any questions, please contact your administrator.</p>
                <p>Best regards,<br>The Zapllo Team</p>
            </div>
            
            <div class="footer">
                <p>This is an automated notification. Please do not reply.</p>
                <p>© 2025 Zapllo. All rights reserved.</p>
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
        <title>Daily CRM Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f0f4f8;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 0;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            padding: 20px;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .banner {
            background: linear-gradient(90deg, #7451F8, #F57E57);
            color: #ffffff;
            padding: 20px 40px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            border-radius: 12px;
            margin: 0 auto 20px;
            max-width: 80%;
          }
          .banner h1 {
            margin: 0;
            font-size: 20px;
          }
          .content {
            padding: 20px;
            text-align: left;
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
            box-shadow: 0 2px 4px rgba(0,0,0,0.07);
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
          .total { border-color: #7451F8; }
          .open { border-color: #FFB547; }
          .won { border-color: #28C76F; }
          .lost { border-color: #EA5455; }
          
          .follow-ups-container {
            background-color: #f8faff;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
            border-left: 3px solid #7451F8;
          }
          
          .follow-ups-title {
            color: #7451F8;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 16px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          
          th {
            background-color: rgba(116, 81, 248, 0.07);
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
            margin: 30px 0;
          }
          
          .cta-button {
            background-color: #0C874B;
            color: #ffffff;
            padding: 12px 24px;
            font-size: 16px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          
          .footer {
            padding: 20px;
            font-size: 12px;
            color: #888888;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" class="logo">
          </div>
          
          <div class="banner">
            <h1>Your Daily CRM Report</h1>
          </div>
          
          <div class="content">
            <p>Dear <strong>${firstName},</strong></p>
            <p>Here's your daily CRM activity report for ${formattedDate}:</p>
            
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
            
            <p>Review your leads and follow-ups to improve conversion rates!</p>
            <p>Best regards,<br>The Zapllo Team</p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification. Please do not reply.</p>
            <p>© 2025 Zapllo. All rights reserved.</p>
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