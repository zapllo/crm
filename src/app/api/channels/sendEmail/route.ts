// app/api/channels/sendEmail/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailAccount from "@/models/EmailAccount";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { sendEmail } from "@/lib/sendEmail";
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
      subject,
      body,
    } = await request.json();
    
    console.log("Request payload:", { templateId, leadId, to, subject, body });

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

    // 3) Prepare subject and body
    let emailSubject = subject || "";  // Changed variable name to avoid conflict
    let emailBody = body || "";        // Changed variable name to avoid conflict

    // Set from template if templateId is provided
    if (templateId) {
      try {
        const template = await EmailTemplate.findById(templateId);
        if (!template) {
          return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }
        emailSubject = template.subject;
        emailBody = template.body;
        console.log("Template found, subject:", emailSubject.slice(0, 30), "body:", emailBody.slice(0, 30));
      } catch (error) {
        console.error("Error processing template:", error);
        return NextResponse.json({ error: "Failed to process template" }, { status: 500 });
      }
    }

    console.log("Final content check - subject:", !!emailSubject, "body:", !!emailBody);
    
    // Check if we have content to send
    if (!emailSubject || !emailBody) {
      return NextResponse.json({ 
        error: "No content provided", 
        subjectPresent: !!emailSubject,
        bodyPresent: !!emailBody,
        templateId: templateId || "none" 
      }, { status: 400 });
    }

     // Process any placeholders in the content
     emailSubject = replacePlaceholders(emailSubject, leadData, contactData, companyData);
     emailBody = replacePlaceholders(emailBody, leadData, contactData, companyData);

    // 4) send email using the updated sendEmail function
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    await sendEmail({
      to,
      subject: emailSubject,
      text: emailBody.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html: emailBody,
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
  if (!text) return "";
  
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