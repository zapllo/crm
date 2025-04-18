// import Lead from "@/models/leadModel";
// import Contact from "@/models/contactModel";
// import FormSubmission from "@/models/formSubmissionModel";
// import Company from "@/models/companyModel";

// // Add this function definition if it's not already present
// async function generateUniqueId(prefix: string) {
//   const timestamp = Date.now().toString().slice(-6);
//   const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
//   return `${prefix.toUpperCase()}-${timestamp}${random}`;
// }

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
//       .populate({
//         path: 'form',
//         model: 'Form'
//       })
//       .populate('organization');

//     if (!submission) {
//       throw new Error("Form submission not found");
//     }

//     // Extract submission data
//     const submissionData = submission.data;
//     console.log("Submission data:", submissionData); // For debugging

//     // Find or create contact based on submission data
//     let contact;
//     let email = '';
//     let phone = '';
//     let firstName = '';
//     let lastName = '';

//     // First try to get email and phone from submitterDetails
//     if (submission.submitterDetails) {
//       if (submission.submitterDetails.email) {
//         email = submission.submitterDetails.email;
//       }
//       if (submission.submitterDetails.phone) {
//         phone = submission.submitterDetails.phone;
//       }
//       if (submission.submitterDetails.name) {
//         const nameParts = submission.submitterDetails.name.split(' ');
//         firstName = nameParts[0];
//         lastName = nameParts.slice(1).join(' ') || 'Unknown';
//       }
//     }

//     // If not found in submitterDetails, search through all form fields
//     if (!email || !phone) {
//       // Extract contact details from submission by checking all fields
//       Object.entries(submissionData).forEach(([fieldId, value]) => {
//         // Skip if value is not a string or is empty
//         if (!value || typeof value !== 'string') return;

//         // Find the field in the form definition
//         const field = submission.form.fields.find(f => f.id === fieldId);
//         if (!field) return;

//         // Match by field type
//         if (field.type === 'email' || field.label.toLowerCase().includes('email')) {
//           email = value;
//         } else if (field.type === 'phone' ||
//           field.label.toLowerCase().includes('phone') ||
//           field.label.toLowerCase().includes('mobile') ||
//           field.label.toLowerCase().includes('whatsapp')) {
//           phone = value;
//         } else if (field.label.toLowerCase().includes('first name') ||
//           (field.label.toLowerCase() === 'name' && !field.label.toLowerCase().includes('last'))) {
//           firstName = value;
//         } else if (field.label.toLowerCase().includes('last name') ||
//           field.label.toLowerCase().includes('surname')) {
//           lastName = value;
//         }
//       });

//       // Also check for generic text fields for name if we still don't have it
//       if (!firstName) {
//         for (const [fieldId, value] of Object.entries(submissionData)) {
//           if (!value || typeof value !== 'string') continue;

//           const field = submission.form.fields.find(f => f.id === fieldId);
//           if (!field) continue;

//           // Look for any text field that might contain a name
//           if (field.type === 'text' &&
//             (field.label.toLowerCase().includes('name') ||
//               ['name', 'full name', 'your name'].includes(field.label.toLowerCase()))) {

//             const nameParts = value.split(' ');
//             firstName = nameParts[0];
//             if (nameParts.length > 1) {
//               lastName = nameParts.slice(1).join(' ');
//             } else {
//               lastName = 'Unknown';
//             }
//             break;
//           }
//         }
//       }
//     }

//     console.log("Extracted contact details:", { email, phone, firstName, lastName }); // For debugging

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
//       // Create a placeholder contact if no email or phone found
//       let companyId = options?.companyId;

//       if (!companyId) {
//         // Find or create default company
//         const defaultCompany = await Company.findOne({
//           companyName: "Default Company",
//           organization: submission.organization._id
//         });

//         if (defaultCompany) {
//           companyId = defaultCompany._id;
//         } else {
//           // Create a default company
//           const newCompany = new Company({
//             companyName: "Default Company",
//             country: submission.organization.country || "Unknown",
//             shippingAddress: "N/A",
//             billingAddress: "N/A",
//             state: "N/A",
//             city: "N/A",
//             organization: submission.organization._id
//           });

//           await newCompany.save();
//           companyId = newCompany._id;
//         }
//       }

//       // Create placeholder contact
//       contact = new Contact({
//         firstName: firstName || "Form",
//         lastName: lastName || "Submission",
//         email: `form_submission_${Date.now()}@placeholder.com`,
//         whatsappNumber: "Unknown",
//         country: submission.organization.country || "Unknown",
//         company: companyId,
//       });

//       await contact.save();

//       // Log a warning but continue with lead creation
//       console.warn("No contact details found in submission - created placeholder contact");
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
