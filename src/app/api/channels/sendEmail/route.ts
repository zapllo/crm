// app/api/channels/sendEmail/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { getDataFromToken } from "@/lib/getDataFromToken";
import { User } from "@/models/userModel";
import { sendEmail } from "@/lib/sendEmail"; // Import your updated sendEmail function
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
      subjectOverride,
      bodyOverride,
    } = await request.json();

    // 1) Identify user
    const userId = getDataFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findById(userId);

    // 2) Build the data for placeholders
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

    // 3) Get the email template and fill placeholders
    let subject = subjectOverride || "";
    let body = bodyOverride || "";
    let htmlContent = bodyOverride || "";

    if (templateId) {
      // Get template content
      const { subject: s, body: b } = await fillTemplateVariables(
        templateId,
        leadData,
        contactData,
        companyData
      );
      subject = s;
      body = b;
      htmlContent = b; // Assuming the body from fillTemplateVariables is HTML
    } else {
      // Process manually entered content
      const { subject: s2, body: b2 } = customFillManual(subject, body, leadData, contactData, companyData);
      subject = s2;
      body = b2;
      htmlContent = b2;
    }

    // 4) Send the email using your updated sendEmail function
    await sendEmail({
      to,
      subject,
      text: body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      html: htmlContent,
      userId: userId.toString() // Pass the userId to use their connected account
    });

    return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}

// Keep your existing custom fill manual function
function customFillManual(
  subject: string,
  body: string,
  leadData: any,
  contactData: any,
  companyData: any
) {
  // Use your existing implementation
  subject = replacePlaceholders(subject, leadData, contactData, companyData);
  body = replacePlaceholders(body, leadData, contactData, companyData);
  return { subject, body };
}

function replacePlaceholders(
  text: string,
  leadData: any,
  contactData: any,
  companyData: any
) {
  // Use your existing implementation
  Object.entries(leadData).forEach(([k, v]) => {
    const placeholder = `{{lead.${k}}}`;
    text = text.replace(new RegExp(placeholder, "g"), String(v));
  });
  Object.entries(contactData).forEach(([k, v]) => {
    const placeholder = `{{contact.${k}}}`;
    text = text.replace(new RegExp(placeholder, "g"), String(v));
  });
  Object.entries(companyData).forEach(([k, v]) => {
    const placeholder = `{{company.${k}}}`;
    text = text.replace(new RegExp(placeholder, "g"), String(v));
  });
  return text;
}