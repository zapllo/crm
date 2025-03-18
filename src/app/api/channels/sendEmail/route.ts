// app/api/channels/sendEmail/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailAccount from "@/models/EmailAccount";
import { User } from "@/models/userModel";
import { getDataFromToken } from "@/lib/getDataFromToken";
import nodemailer from "nodemailer";
import { fillTemplateVariables } from "@/utils/fillTemplateVariables";
import Lead from "@/models/leadModel";
import Contact from "@/models/contactModel";
import Company from "@/models/companyModel";

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

    // 2) Find the user's email account or fallback to .env
    const emailAccount = await EmailAccount.findOne({ userId, provider: "google" });
    let transporter;
    if (emailAccount) {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: emailAccount.emailAddress,
          accessToken: emailAccount.accessToken,
          refreshToken: emailAccount.refreshToken,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // 3) Build the data for placeholders by fetching the lead & its contact/company
    //    so if the user typed {{contact.firstName}}, we know how to fill it.
    let leadData = {};
    let contactData = {};
    let companyData = {};

    if (leadId) {
      const leadDoc = await Lead.findById(leadId)
        .populate("contact")     // so we can read contact fields
        .populate({
          path: "contact",
          populate: { path: "company" }, // if you want to fetch the company
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
          // etc.
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
            // etc.
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
              // etc.
            };
          }
        }
      }
    }

    // 4) fill placeholders
    let subject = subjectOverride || "";
    let body = bodyOverride || "";

    if (templateId) {
      // If we are also picking a template from the DB
      const { subject: s, body: b } = await fillTemplateVariables(
        templateId,
        leadData,
        contactData,
        companyData
      );
      subject = s;
      body = b;
    } else {
      // If user is just manually typed subjectOverride, we can also run a smaller fill on them
      // if you want placeholders replaced in manual mode too:
      const { subject: s2, body: b2 } = customFillManual(subject, body, leadData, contactData, companyData);
      subject = s2;
      body = b2;
    }

    // 5) send
    const info = await transporter.sendMail({
      from: emailAccount?.emailAddress || process.env.SMTP_USER,
      to,
      subject,
      html: body,
    });

    return NextResponse.json({ message: "Email sent", info }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

/**
 * If you want to fill placeholders even in "manual" mode (with no templateId),
 * you can do it by scanning subjectOverride/bodyOverride for placeholders.
 * For example:
 */
function customFillManual(
  subject: string,
  body: string,
  leadData: any,
  contactData: any,
  companyData: any
) {
  // naive approach:
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
  // For each { lead, contact, company } key, do a simple replace
  // For a robust approach, you'd do something similar to fillTemplateVariables
  // or pass them into the same function.
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
