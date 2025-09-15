
import connectDB from "@/lib/db";
import EmailTemplate from "@/models/EmailTemplate";

interface DataSet {
  [key: string]: any;
}

export async function fillTemplateVariables(
  templateId: string,
  leadData: DataSet = {},
  contactData: DataSet = {},
  companyData: DataSet = {}
) {
  await connectDB();
  const template = await EmailTemplate.findById(templateId);
  if (!template) throw new Error("Template not found");

  let subject = template.subject;
  let body = template.body;

  // Build replacement dictionary
  const replacements = {
    ...Object.entries(leadData).reduce((acc, [k, v]) => {
      acc[`{{lead.${k}}}`] = v;
      return acc;
    }, {} as Record<string, any>),

    ...Object.entries(contactData).reduce((acc, [k, v]) => {
      acc[`{{contact.${k}}}`] = v;
      return acc;
    }, {} as Record<string, any>),

    ...Object.entries(companyData).reduce((acc, [k, v]) => {
      acc[`{{company.${k}}}`] = v;
      return acc;
    }, {} as Record<string, any>),
  };

  // Replace in subject/body
  for (const placeholder of Object.keys(replacements)) {
    const value = replacements[placeholder];
    const regex = new RegExp(placeholder, "g");
    subject = subject.replace(regex, value);
    body = body.replace(regex, value);
  }

  return { subject, body };
}
