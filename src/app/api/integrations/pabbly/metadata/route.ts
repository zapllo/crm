import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "Zapllo CRM",
    version: "1.0.0",
    description: "Integrate Zapllo CRM with Pabbly Connect for seamless automation",
    icon: "https://crm.zapllo.com/api/integrations/pabbly/icon",
    auth: {
      type: "api_key",
      headerKey: "x-api-key",
      description: "Please enter your Zapllo CRM API key"
    },
    triggers: [
      {
        id: "new_contact",
        name: "New Contact",
        description: "Triggers when a new contact is created",
        apiUrl: "https://crm.zapllo.com/api/integrations/pabbly/triggers",
        method: "POST",
        requestBody: {
          triggerKey: "new_contact"
        },
        output: [
          {id: "id", name: "ID", type: "string"},
          {id: "firstName", name: "First Name", type: "string"},
          {id: "lastName", name: "Last Name", type: "string"},
          {id: "email", name: "Email", type: "string"},
          {id: "whatsappNumber", name: "WhatsApp Number", type: "string"},
          {id: "createdAt", name: "Created At", type: "datetime"}
        ]
      },
      {
        id: "new_lead",
        name: "New Lead",
        description: "Triggers when a new lead is created",
        apiUrl: "https://crm.zapllo.com/api/integrations/pabbly/triggers",
        method: "POST",
        requestBody: {
          triggerKey: "new_lead"
        },
        output: [
          {id: "id", name: "ID", type: "string"},
          {id: "title", name: "Title", type: "string"},
          {id: "description", name: "Description", type: "string"},
          {id: "stage", name: "Stage", type: "string"},
          {id: "amount", name: "Amount", type: "number"},
          {id: "createdAt", name: "Created At", type: "datetime"}
        ]
      }
    ],
    actions: [
      {
        id: "create_contact",
        name: "Create Contact",
        description: "Creates a new contact in the CRM",
        apiUrl: "https://crm.zapllo.com/api/webhooks/contacts",
        method: "POST",
        requestBody: {
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
        },
        input: [
          {id: "firstName", name: "First Name", type: "string", required: true},
          {id: "lastName", name: "Last Name", type: "string", required: true},
          {id: "email", name: "Email", type: "string", required: true},
          {id: "whatsappNumber", name: "WhatsApp Number", type: "string"},
          {id: "company", name: "Company ID", type: "string", required: true, description: "ID of the company in your CRM"},
          {id: "country", name: "Country", type: "string"},
          {id: "state", name: "State", type: "string"},
          {id: "city", name: "City", type: "string"},
          {id: "pincode", name: "Postal/ZIP Code", type: "string"},
          {id: "address", name: "Address", type: "string"}
        ],
        output: [
          {id: "id", name: "Contact ID", type: "string"},
          {id: "firstName", name: "First Name", type: "string"},
          {id: "lastName", name: "Last Name", type: "string"},
          {id: "email", name: "Email", type: "string"}
        ]
      },
      {
        id: "create_lead",
        name: "Create Lead",
        description: "Creates a new lead in the CRM",
        apiUrl: "https://crm.zapllo.com/api/webhooks/leads",
        method: "POST",
        requestBody: {
          data: {
            title: "{{title}}",
            description: "{{description}}",
            contact: "{{contact}}",
            amount: "{{amount}}",
            closeDate: "{{closeDate}}",
            pipeline: "{{pipeline}}",
            source: "{{source}}"
          }
        },
        input: [
          {id: "title", name: "Lead Title", type: "string", required: true},
          {id: "description", name: "Description", type: "text"},
          {id: "contact", name: "Contact ID or Email", type: "string", required: true, description: "ID or email of an existing contact in your CRM"},
          {id: "amount", name: "Deal Amount", type: "number"},
          {id: "closeDate", name: "Expected Close Date", type: "datetime"},
          {id: "pipeline", name: "Pipeline ID", type: "string", description: "ID of a pipeline in your CRM"},
          {id: "source", name: "Lead Source", type: "string", description: "Where this lead came from"}
        ],
        output: [
          {id: "id", name: "Lead ID", type: "string"},
          {id: "title", name: "Title", type: "string"},
          {id: "stage", name: "Stage", type: "string"}
        ]
      }
    ],
    search: [
      {
        id: "find_contact",
        name: "Find Contact",
        description: "Finds a contact by email or ID",
        apiUrl: "https://crm.zapllo.com/api/integrations/pabbly/searches",
        method: "POST",
        requestBody: {
          searchKey: "find_contact",
          criteria: "{{criteria}}"
        },
        input: [
          {id: "criteria", name: "Email or ID", type: "string", required: true}
        ],
        output: [
          {id: "id", name: "ID", type: "string"},
          {id: "firstName", name: "First Name", type: "string"},
          {id: "lastName", name: "Last Name", type: "string"},
          {id: "email", name: "Email", type: "string"},
          {id: "whatsappNumber", name: "WhatsApp Number", type: "string"}
        ]
      }
    ]
  });
}