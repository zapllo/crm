// app/api/channels/sendEmail/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailAccount from "@/models/EmailAccount";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendEmail } from "@/lib/sendEmail";
import { fillTemplateVariables } from "@/utils/fillTemplateVariables";
import Lead from "@/models/leadModel";
import Contact from "@/models/contactModel";
import Company from "@/models/companyModel";
import EmailTemplate from "@/models/EmailTemplate";

export async function POST(request: Request) {
  try {
    await connectDB();
    const {
      templateId,
      leadId,
      to,
      subject: subjectOverride,
      body: bodyOverride,
    } = await request.json();

    // 1) Identify user
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the user has a connected Google account
    const emailAccount = await EmailAccount.findOne({ userId, provider: "google" });
    console.log("Google account connected:", emailAccount ? "Yes" : "No");

    // 2) Build the data for placeholders by fetching the lead & its contact/company
    let leadData = {};
    let contactData = {};
    let companyData = {};

    if (leadId) {
      const leadDoc = await Lead.findById(leadId)
        .populate("contact")
        .populate({
          path: "contact",
          populate: { path: "company" },
        })
        .exec();

      if (leadDoc) {
        // Fill leadData with relevant fields
        leadData = {
          title: leadDoc.title,
          description: leadDoc.description,
          amount: leadDoc.amount,
          closeDate: leadDoc.closeDate ? leadDoc.closeDate.toISOString().split("T")[0] : "",
          stage: leadDoc.stage,
          source: leadDoc.source,
        };

        // If leadDoc.contact is populated, fill contactData
        if (leadDoc.contact) {
          const c: any = leadDoc.contact;
          contactData = {
            firstName: c.firstName || "",
            lastName: c.lastName || "",
            email: c.email || "",
            whatsappNumber: c.whatsappNumber || "",
            city: c.city || "",
            country: c.country || "",
          };

          // If that contact has a company, fill companyData
          if (c.company) {
            const comp: any = c.company;
            companyData = {
              companyName: comp.companyName,
              taxNo: comp.taxNo,
              country: comp.country,
              city: comp.city,
              website: comp.website,
            };
          }
        }
      }
    }

    // 3) Prepare subject and body - from template or from override
    let subject = subjectOverride || "";
    let body = bodyOverride || "";

    if (templateId) {
      try {
        // Get template content and fill placeholders
        const template = await EmailTemplate.findById(templateId);
        if (!template) {
          return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }
        
        // Use template content as base
        subject = template.subject;
        body = template.body;
        
        // Process template variables
        subject = replacePlaceholders(subject, leadData, contactData, companyData);
        body = replacePlaceholders(body, leadData, contactData, companyData);
      } catch (error) {
        console.error("Error processing template:", error);
        return NextResponse.json({ error: "Failed to process template" }, { status: 500 });
      }
    } else if (subjectOverride || bodyOverride) {
      // Direct input - still process any placeholders
      subject = replacePlaceholders(subjectOverride || "", leadData, contactData, companyData);
      body = replacePlaceholders(bodyOverride || "", leadData, contactData, companyData);
    } else {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    // 4) send email using the updated sendEmail function
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    await sendEmail({
      to,
      subject,
      text: body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html: body,
      userId: userId.toString() // Pass userId to use connected account if available
    });

    return NextResponse.json({ 
      success: true, 
      message: "Email sent successfully",
      provider: emailAccount ? "google" : "default",
      fromAddress: emailAccount ? emailAccount.emailAddress : process.env.SMTP_USER
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ 
      error: "Failed to send email", 
      message: error.message,
      details: error.response?.data || error.toString()
    }, { status: 500 });
  }
}

// Helper function to replace placeholders with actual data
function replacePlaceholders(text: string, leadData: any, contactData: any, companyData: any) {
  // Replace lead data placeholders
  Object.entries(leadData).forEach(([key, value]) => {
    text = text.replace(new RegExp(`{{lead\\.${key}}}`, 'g'), String(value || ''));
  });
  
  // Replace contact data placeholders
  Object.entries(contactData).forEach(([key, value]) => {
    text = text.replace(new RegExp(`{{contact\\.${key}}}`, 'g'), String(value || ''));
  });
  
  // Replace company data placeholders
  Object.entries(companyData).forEach(([key, value]) => {
    text = text.replace(new RegExp(`{{company\\.${key}}}`, 'g'), String(value || ''));
  });
  
  return text;
}