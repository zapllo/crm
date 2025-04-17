// import Lead from "@/models/leadModel";
// import Contact from "@/models/contactModel";
// import FormSubmission from "@/models/formSubmissionModel";
// import Company from "@/models/companyModel";

// /**
//  * Converts a form submission to a CRM lead
//  * @param submissionId - The ID of the form submission
//  * @param pipelineId - The pipeline to create the lead in
//  * @param stageId - The initial stage for the lead
//  * @param userId - The user ID of who is converting the submission
//  * @param options - Additional options like company ID, source, etc.
//  */
// export async function convertSubmissionToLead(
//   submissionId: string,
//   pipelineId: string,
//   stageId: string,
//   userId: string,
//   options?: {
//     companyId?: string;
//     sourceId?: string;
//     productId?: string;
//     amount?: number;
//     closeDate?: Date;
//   }
// ) {
//   try {
//     // Find the submission with populated form info
//     const submission = await FormSubmission.findById(submissionId)
//       .populate('form')
//       .populate('organization');

//     if (!submission) {
//       throw new Error("Form submission not found");
//     }

//     // Extract submission data
//     const submissionData = submission.data;

//     // Find or create contact based on submission data
//     let contact;
//     let email = '';
//     let phone = '';
//     let firstName = '';
//     let lastName = '';

//     // Extract contact details from submission
//     Object.entries(submissionData).forEach(([fieldId, value]) => {
//       // Find the field in the form definition
//       const field = submission.form.fields.find(f => f.id === fieldId);
//       if (!field) return;

//       if (field.type === 'email') {
//         email = value as string;
//       } else if (field.type === 'phone') {
//         phone = value as string;
//       } else if (field.label.toLowerCase().includes('first name') || field.label.toLowerCase() === 'name') {
//         firstName = value as string;
//       } else if (field.label.toLowerCase().includes('last name') || field.label.toLowerCase() === 'surname') {
//         lastName = value as string;
//       }
//     });

//     // If name is in a single field, split it
//     if (firstName && !lastName && firstName.includes(' ')) {
//       const nameParts = firstName.split(' ');
//       firstName = nameParts[0];
//       lastName = nameParts.slice(1).join(' ');
//     }

//     // If we have at least an email or phone, try to find existing contact
//     if (email || phone) {
//       const query: any = {};
//       if (email) query.email = email;
//       if (phone && !email) query.whatsappNumber = phone;

//       contact = await Contact.findOne(query);

//       // If no contact exists, create a new one
//       if (!contact) {
//         // Check if we need to create a default company first
//         let companyId = options?.companyId;

//         if (!companyId) {
//           // Create or find a default company for this organization
//           const defaultCompany = await Company.findOne({
//             companyName: "Default Company",
//             organization: submission.organization._id
//           });

//           if (defaultCompany) {
//             companyId = defaultCompany._id;
//           } else {
//             // Create a default company
//             const newCompany = new Company({
//               companyName: "Default Company",
//               country: submission.organization.country || "Unknown",
//               shippingAddress: "N/A",
//               billingAddress: "N/A",
//               state: "N/A",
//               city: "N/A",
//               organization: submission.organization._id
//             });

//             await newCompany.save();
//             companyId = newCompany._id;
//           }
//         }

//         // Create new contact
//         contact = new Contact({
//           firstName: firstName || "Unknown",
//           lastName: lastName || "Unknown",
//           email: email || `unknown_${Date.now()}@placeholder.com`,
//           whatsappNumber: phone || "Unknown",
//           country: submission.organization.country || "Unknown",
//           company: companyId,
//           // Add relevant custom field values based on form data
//           customFieldValues: []
//         });

//         await contact.save();
//       }
//     } else {
//       throw new Error("Cannot create lead: No contact details found in submission");
//     }

//     // Create lead title based on form name and contact name
//     const leadTitle = `${submission.form.name} - ${firstName} ${lastName}`.trim();

//     // Create the lead
//     const lead = new Lead({
//       leadId: await generateUniqueId('lead'),
//       title: leadTitle,
//       description: "Generated from form submission",
//       contact: contact._id,
//       pipeline: pipelineId,
//       stage: stageId,
//       organization: submission.organization._id,
//       assignedTo: userId,
//       // Optional fields
//       product: options?.productId,
//       amount: options?.amount,
//       closeDate: options?.closeDate,
//       source: options?.sourceId,
//       // Add initial timeline entry
//       timeline: [{
//         stage: stageId,
//         action: "Created from form submission",
//         remark: `Lead generated from form: ${submission.form.name}`,
//         movedBy: userId,
//         timestamp: new Date(),
//         type: "conversion"
//       }],
//     });

//     await lead.save();

//     // Update the submission with the lead reference
//     submission.leadId = lead._id;
//     submission.contactId = contact._id;
//     submission.status = 'converted';
//     submission.notes = submission.notes || [];
//     submission.notes.push({
//       text: `Converted to lead (ID: ${lead.leadId})`,
//       createdBy: userId,
//       createdAt: new Date()
//     });

//     await submission.save();

//     return {
//       success: true,
//       leadId: lead._id,
//       contactId: contact._id,
//       lead: lead
//     };
//   } catch (error: any) {
//     console.error("Error converting submission to lead:", error);
//     return {
//       success: false,
//       error: error.message
//     };
//   }
// }
