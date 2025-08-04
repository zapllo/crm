import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "Zapllo CRM",
    branding: {
      brandColor: "#805CF5",
      icon: "https://crm.zapllo.com/api/integrations/zapier/icon"
    },
    authentication: {
      type: "api_key",
      apiKey: {
        location: "header",
        key: "x-api-key"
      }
    },
    version: "1.0.0",
    platformVersion: "2.0.0",
    triggers: [
      {
        key: "new_contact",
        noun: "Contact",
        display: {
          label: "New Contact",
          description: "Triggers when a new contact is created"
        },
        operation: {
          perform: {
            url: "https://crm.zapllo.com/api/integrations/zapier/triggers",
            method: "POST",
            body: {
              triggerKey: "new_contact"
            }
          },
          inputFields: [],
          outputFields: [
            {id: "id", label: "ID", type: "string"},
            {id: "firstName", label: "First Name", type: "string"},
            {id: "lastName", label: "Last Name", type: "string"},
            {id: "email", label: "Email", type: "string"},
            {id: "whatsappNumber", label: "WhatsApp Number", type: "string"},
            {id: "createdAt", label: "Created At", type: "datetime"}
          ]
        }
      },
      {
        key: "new_lead",
        noun: "Lead",
        display: {
          label: "New Lead",
          description: "Triggers when a new lead is created"
        },
        operation: {
          perform: {
            url: "https://crm.zapllo.com/api/integrations/zapier/triggers",
            method: "POST",
            body: {
              triggerKey: "new_lead"
            }
          },
          inputFields: [],
          outputFields: [
            {id: "id", label: "ID", type: "string"},
            {id: "title", label: "Title", type: "string"},
            {id: "description", label: "Description", type: "string"},
            {id: "stage", label: "Stage", type: "string"},
            {id: "amount", label: "Amount", type: "number"},
            {id: "createdAt", label: "Created At", type: "datetime"}
          ]
        }
      }
    ],
    actions: [
      {
        key: "create_contact",
        noun: "Contact",
        display: {
          label: "Create Contact",
          description: "Creates a new contact in the CRM"
        },
        operation: {
          perform: {
            url: "https://crm.zapllo.com/api/webhooks/contacts",
            method: "POST",
            body: {
              data: {
                firstName: "{{firstName}}",
                lastName: "{{lastName}}",
                email: "{{email}}",
                whatsappNumber: "{{whatsappNumber}}",
                company: "{{company}}",
                country: "{{country}}",
                state: "{{state}}",
                city: "{{city}}",
                pincode: "{{pincode}}",
                address: "{{address}}"
              }
            }
          },
          inputFields: [
            {id: "firstName", label: "First Name", type: "string", required: true},
            {id: "lastName", label: "Last Name", type: "string", required: true},
            {id: "email", label: "Email", type: "string", required: true},
            {id: "whatsappNumber", label: "WhatsApp Number", type: "string"},
            {id: "company", label: "Company ID", type: "string", required: true, helpText: "ID of the company in your CRM"},
            {id: "country", label: "Country", type: "string"},
            {id: "state", label: "State", type: "string"},
            {id: "city", label: "City", type: "string"},
            {id: "pincode", label: "Postal/ZIP Code", type: "string"},
            {id: "address", label: "Address", type: "string"}
          ],
          outputFields: [
            {id: "id", label: "Contact ID", type: "string"},
            {id: "firstName", label: "First Name", type: "string"},
            {id: "lastName", label: "Last Name", type: "string"},
            {id: "email", label: "Email", type: "string"}
          ]
        }
      },
      {
        key: "create_lead",
        noun: "Lead",
        display: {
          label: "Create Lead",
          description: "Creates a new lead in the CRM"
        },
        operation: {
          perform: {
            url: "https://crm.zapllo.com/api/webhooks/leads",
            method: "POST",
            body: {
              data: {
                title: "{{title}}",
                description: "{{description}}",
                contact: "{{contact}}",
                amount: "{{amount}}",
                closeDate: "{{closeDate}}",
                pipeline: "{{pipeline}}",
                source: "{{source}}"
              }
            }
          },
          inputFields: [
            {id: "title", label: "Lead Title", type: "string", required: true},
            {id: "description", label: "Description", type: "text"},
            {id: "contact", label: "Contact ID or Email", type: "string", required: true, helpText: "ID or email of an existing contact in your CRM"},
            {id: "amount", label: "Deal Amount", type: "number"},
            {id: "closeDate", label: "Expected Close Date", type: "datetime"},
            {id: "pipeline", label: "Pipeline ID", type: "string", helpText: "ID of a pipeline in your CRM"},
            {id: "source", label: "Lead Source", type: "string", helpText: "Where this lead came from"}
          ],
          outputFields: [
            {id: "id", label: "Lead ID", type: "string"},
            {id: "title", label: "Title", type: "string"},
            {id: "stage", label: "Stage", type: "string"}
          ]
        }
      }
    ],
    searches: [
      {
        key: "find_contact",
        noun: "Contact",
        display: {
          label: "Find Contact",
          description: "Finds a contact by email or ID"
        },
        operation: {
          perform: {
            url: "https://crm.zapllo.com/api/integrations/zapier/searches",
            method: "POST",
            body: {
              searchKey: "find_contact",
              criteria: "{{criteria}}"
            }
          },
          inputFields: [
            {id: "criteria", label: "Email or ID", type: "string", required: true}
          ],
          outputFields: [
            {id: "id", label: "ID", type: "string"},
            {id: "firstName", label: "First Name", type: "string"},
            {id: "lastName", label: "Last Name", type: "string"},
            {id: "email", label: "Email", type: "string"},
            {id: "whatsappNumber", label: "WhatsApp Number", type: "string"}
          ]
        }
      }
    ]
  });
}