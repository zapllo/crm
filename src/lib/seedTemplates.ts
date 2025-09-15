import QuotationTemplateModel from "@/models/quotationTemplateModel";
import connectDB from "@/lib/db";

const prebuiltTemplates = [
  // 1. Corporate Blue - Professional and Clean
  {
    name: "Corporate Blue",
    description: "A clean, professional template with blue accents perfect for corporate use",
    isDefault: true,
    previewImage: "/images/templates/corporate-blue.jpg",
    layout: {
      header: {
        show: true,
        height: 120,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding: 30px 0; border-bottom: 2px solid #E5E7EB;">
          <div style="display: flex; align-items: center; gap: 24px;">
            <div style="padding: 4px;">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 32px; font-weight: 700; color: #1F2937; margin: 0 0 8px 0; letter-spacing: -0.01em;">{{company_name}}</h1>
              <div style="font-size: 16px; color: #6B7280; font-weight: 500;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; color: #374151; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Quotation</div>
            <div style="font-size: 24px; font-weight: 700; color: #1F46BA; margin-bottom: 8px;">{{quotation_number}}</div>
            <div style="font-size: 14px; color: #6B7280;">Date: {{date}}</div>
            <div style="font-size: 14px; color: #6B7280;">Valid Until: {{valid_until}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6B7280; padding: 20px 0; border-top: 1px solid #E5E7EB; margin-top: 40px;">
          <div>
            <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">{{company_name}}</div>
            <div>{{company_address}}</div>
            <div style="margin-top: 4px;">{{company_email}} • {{company_phone}}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-weight: 600; color: #374151;">Thank you for your business</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; color: #374151;">{{company_website}}</div>
          </div>
        </div>`,
      },
      sections: [
        {
          id: "client_info",
          type: "client_info",
          title: "Client Information",
          content: "",
          order: 1,
          isVisible: true,
          styles: {},
        },
        {
          id: "items_table",
          type: "items_table",
          title: "Products & Services",
          content: "",
          order: 2,
          isVisible: true,
          styles: {},
        },
        {
          id: "summary",
          type: "summary",
          title: "Summary",
          content: "",
          order: 3,
          isVisible: true,
          styles: {},
        },
        {
          id: "terms",
          type: "terms",
          title: "Terms & Conditions",
          content: "",
          order: 4,
          isVisible: true,
          styles: {},
        },
        {
          id: "additional_logos",
          type: "additional_logos",
          title: "Partners & Certifications",
          content: "",
          order: 5,
          isVisible: true,
          styles: {},
        },
      ],
    },
    styles: {
      primaryColor: "#1F46BA",
      secondaryColor: "#1E40AF",
      backgroundColor: "#ffffff",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: "14px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        /* Force light theme regardless of system preference */
        * {
          color-scheme: light !important;
        }
        
        .quotation-container {
          background-color: #ffffff !important;
          color: #374151 !important;
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
        }
        
        .quotation-section-title {
          color: #1F2937 !important;
          font-size: 20px;
          font-weight: 600;
          margin: 32px 0 20px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #1F46BA;
          letter-spacing: -0.01em;
        }
        
        .quotation-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          border: 1px solid #D1D5DB;
        }
        
        .quotation-table th {
          background-color: #1F46BA !important;
          color: #ffffff !important;
          font-weight: 600;
          padding: 16px;
          text-align: left;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .quotation-table td {
          padding: 16px;
          border-bottom: 1px solid #E5E7EB;
          color: #374151 !important;
          background-color: #ffffff !important;
        }
        
        .quotation-table tr:nth-child(even) td {
          background-color: #F9FAFB !important;
        }
        
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        
        .quotation-total-row td {
          font-weight: 700;
          background-color: #EFF6FF !important;
          color: #1F46BA !important;
          border-top: 2px solid #1F46BA;
        }
        
        .client-info {
          background-color: #F8FAFC !important;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
          border-left: 4px solid #1F46BA;
        }
        
        .client-info h3 {
          color: #1F2937 !important;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          padding-bottom: 8px;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .info-label {
          color: #1F46BA !important;
          font-weight: 600 !important;
          font-size: 14px;
          display: block;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .info-value {
          color: #374151 !important;
          font-size: 14px;
          margin-bottom: 12px;
        }
        
        .terms-heading {
          color: #1F46BA !important;
          font-weight: 600;
          font-size: 16px;
          margin: 24px 0 12px 0;
        }
        
        .summary-row-label {
          font-weight: 600;
          color: #374151 !important;
        }
        
        /* Override any dark mode attempts */
        @media (prefers-color-scheme: dark) {
          .quotation-container,
          .quotation-container *,
          .quotation-table,
          .quotation-table *,
          .client-info,
          .client-info * {
            background-color: #ffffff !important;
            color: #374151 !important;
          }
          
          .quotation-table th {
            background-color: #1F46BA !important;
            color: #ffffff !important;
          }
          
          .quotation-table tr:nth-child(even) td {
            background-color: #F9FAFB !important;
          }
          
          .quotation-total-row td {
            background-color: #EFF6FF !important;
            color: #1F46BA !important;
          }
          
          .client-info {
            background-color: #F8FAFC !important;
          }
          
          .quotation-section-title {
            color: #1F2937 !important;
          }
          
          .info-label {
            color: #1F46BA !important;
          }
          
          .info-value {
            color: #374151 !important;
          }
          
          .terms-heading {
            color: #1F46BA !important;
          }
          
          .summary-row-label {
            color: #374151 !important;
          }
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  },
  
  // 2. Executive Gray - Premium and Sophisticated
  {
    name: "Executive Gray",
    description: "A sophisticated template with gray tones for executive-level presentations",
    isDefault: false,
    previewImage: "/images/templates/executive-gray.jpg",
    layout: {
      header: {
        show: true,
        height: 140,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding: 40px 0; border-bottom: 3px solid #374151;">
          <div style="display: flex; align-items: center; gap: 28px;">
            <div style="padding: 4px;">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 36px; font-weight: 600; color: #111827; margin: 0 0 10px 0; letter-spacing: -0.02em;">{{company_name}}</h1>
              <div style="font-size: 18px; color: #6B7280; font-weight: 400;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="text-align: right; background-color: #F9FAFB; padding: 24px; border: 1px solid #D1D5DB;">
            <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Professional Quotation</div>
            <div style="font-size: 28px; font-weight: 700; color: #111827; margin-bottom: 16px;">{{quotation_number}}</div>
            <div style="font-size: 14px; color: #6B7280; margin-bottom: 4px;"><strong>Issue Date:</strong> {{date}}</div>
            <div style="font-size: 14px; color: #6B7280;"><strong>Valid Until:</strong> {{valid_until}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 90,
        content: `<div style="margin-top: 50px; padding: 25px 0; border-top: 2px solid #E5E7EB;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 8px;">{{company_name}}</div>
              <div style="font-size: 13px; color: #6B7280; line-height: 1.5;">{{company_address}}</div>
              <div style="font-size: 13px; color: #374151; margin-top: 6px;">{{company_website}}</div>
            </div>
            <div style="text-align: center; flex: 1;">
              <div style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px;">Thank You</div>
              <div style="font-size: 14px; color: #6B7280;">for considering our proposal</div>
              <div style="font-size: 12px; color: #9CA3AF; margin-top: 8px;">Page {{page_number}} of {{total_pages}}</div>
            </div>
            <div style="text-align: right; flex: 1;">
              <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 6px;">Contact Us</div>
              <div style="font-size: 13px; color: #6B7280;">{{company_email}}</div>
              <div style="font-size: 13px; color: #6B7280;">{{company_phone}}</div>
            </div>
          </div>
        </div>`,
      },
      sections: [
        {
          id: "client_info",
          type: "client_info",
          title: "Client Information",
          content: "",
          order: 1,
          isVisible: true,
          styles: {},
        },
        {
          id: "items_table",
          type: "items_table",
          title: "Products & Services",
          content: "",
          order: 2,
          isVisible: true,
          styles: {},
        },
        {
          id: "summary",
          type: "summary",
          title: "Investment Summary",
          content: "",
          order: 3,
          isVisible: true,
          styles: {},
        },
        {
          id: "terms",
          type: "terms",
          title: "Terms & Conditions",
          content: "",
          order: 4,
          isVisible: true,
          styles: {},
        },
        {
          id: "additional_logos",
          type: "additional_logos",
          title: "Our Partners",
          content: "",
          order: 5,
          isVisible: true,
          styles: {},
        },
      ],
    },
    styles: {
      primaryColor: "#374151",
      secondaryColor: "#111827",
      backgroundColor: "#ffffff",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: "14px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        /* Force light theme regardless of system preference */
        * {
          color-scheme: light !important;
        }
        
        .quotation-container {
          background-color: #ffffff !important;
          color: #374151 !important;
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.6;
        }
        
        .quotation-section-title {
          color: #111827 !important;
          font-size: 22px;
          font-weight: 600;
          margin: 36px 0 24px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #374151;
          letter-spacing: -0.01em;
        }
        
        .quotation-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
          border: 1px solid #D1D5DB;
        }
        
        .quotation-table th {
          background-color: #374151 !important;
          color: #ffffff !important;
          font-weight: 600;
          padding: 18px;
          text-align: left;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .quotation-table td {
          padding: 18px;
          border-bottom: 1px solid #E5E7EB;
          color: #374151 !important;
          background-color: #ffffff !important;
          font-weight: 500;
        }
        
        .quotation-table tr:nth-child(even) td {
          background-color: #FAFAFA !important;
        }
        
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        
        .quotation-total-row td {
          font-weight: 700;
          font-size: 16px;
          background-color: #F3F4F6 !important;
          color: #111827 !important;
          border-top: 2px solid #374151;
        }
        
        .client-info {
          background-color: #FAFAFA !important;
          border-radius: 8px;
          padding: 28px;
          margin: 28px 0;
          border: 1px solid #E5E7EB;
        }
        
        .client-info h3 {
          color: #111827 !important;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 24px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #D1D5DB;
        }
        
        .info-label {
          color: #374151 !important;
          font-weight: 600 !important;
          font-size: 14px;
          display: block;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .info-value {
          color: #111827 !important;
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        
        .terms-heading {
          color: #374151 !important;
          font-weight: 600;
          font-size: 17px;
          margin: 28px 0 14px 0;
        }
        
        .summary-row-label {
          font-weight: 600;
          color: #374151 !important;
        }
        
        /* Override any dark mode attempts */
        @media (prefers-color-scheme: dark) {
          .quotation-container,
          .quotation-container *,
          .quotation-table,
          .quotation-table *,
          .client-info,
          .client-info * {
            background-color: #ffffff !important;
            color: #374151 !important;
          }
          
          .quotation-table th {
            background-color: #374151 !important;
            color: #ffffff !important;
          }
          
          .quotation-table tr:nth-child(even) td {
            background-color: #FAFAFA !important;
          }
          
          .quotation-total-row td {
            background-color: #F3F4F6 !important;
            color: #111827 !important;
          }
          
          .client-info {
            background-color: #FAFAFA !important;
          }
          
          .quotation-section-title {
            color: #111827 !important;
          }
          
          .info-label {
            color: #374151 !important;
          }
          
          .info-value {
            color: #111827 !important;
          }
          
          .terms-heading {
            color: #374151 !important;
          }
          
          .summary-row-label {
            color: #374151 !important;
          }
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  },
  
  // 3. Modern Minimalist - Clean and Simple
  {
    name: "Modern Minimalist",
    description: "A clean, minimalist template with modern design principles",
    isDefault: false,
    previewImage: "/images/templates/modern-minimalist.jpg",
    layout: {
      header: {
        show: true,
        height: 110,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding: 32px 0; border-bottom: 2px solid #000000;">
          <div style="display: flex; align-items: center; gap: 32px;">
            <div style="padding: 4px;">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 40px; font-weight: 300; color: #000000; margin: 0 0 8px 0; letter-spacing: -0.02em;">{{company_name}}</h1>
              <div style="font-size: 16px; color: #666666; font-weight: 400;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="text-align: right; border: 2px solid #000000; padding: 20px; background-color: #ffffff;">
            <div style="font-size: 12px; color: #000000; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px;">QUOTATION</div>
            <div style="font-size: 32px; font-weight: 300; color: #000000; margin-bottom: 12px; letter-spacing: -0.01em;">{{quotation_number}}</div>
            <div style="font-size: 14px; color: #666666; margin-bottom: 4px;">{{date}}</div>
            <div style="font-size: 14px; color: #666666;">Valid: {{valid_until}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 70,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #666666; padding: 24px 0; border-top: 1px solid #E5E7EB; margin-top: 48px;">
          <div>
            <div style="font-weight: 600; color: #000000; margin-bottom: 4px;">{{company_name}}</div>
            <div>{{company_address}} • {{company_email}} • {{company_phone}}</div>
          </div>
          <div style="text-align: center;">
            <div style="font-weight: 400; color: #000000;">Page {{page_number}} of {{total_pages}}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600; color: #000000;">Thank you</div>
          </div>
        </div>`,
      },
      sections: [
        {
          id: "client_info",
          type: "client_info",
          title: "Client Details",
          content: "",
          order: 1,
          isVisible: true,
          styles: {},
        },
        {
          id: "items_table",
          type: "items_table",
          title: "Services",
          content: "",
          order: 2,
          isVisible: true,
          styles: {},
        },
        {
          id: "summary",
          type: "summary",
          title: "Total",
          content: "",
          order: 3,
          isVisible: true,
          styles: {},
        },
        {
          id: "terms",
          type: "terms",
          title: "Terms",
          content: "",
          order: 4,
          isVisible: true,
          styles: {},
        },
        {
          id: "additional_logos",
          type: "additional_logos",
          title: "Partners",
          content: "",
          order: 5,
          isVisible: true,
          styles: {},
        },
      ],
    },
    styles: {
      primaryColor: "#000000",
      secondaryColor: "#333333",
      backgroundColor: "#ffffff",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: "14px",
      borderStyle: "solid",
      tableBorders: false,
      alternateRowColors: false,
      customCSS: `
        /* Force light theme regardless of system preference */
        * {
          color-scheme: light !important;
        }
        
        .quotation-container {
          background-color: #ffffff !important;
          color: #333333 !important;
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.7;
        }
        
        .quotation-section-title {
          color: #000000 !important;
          font-size: 24px;
          font-weight: 300;
          margin: 48px 0 28px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #000000;
          letter-spacing: -0.01em;
        }
        
        .quotation-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
          border: none;
        }
        
        .quotation-table th {
          background-color: #000000 !important;
          color: #ffffff !important;
          font-weight: 500;
          padding: 20px;
          text-align: left;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .quotation-table td {
          padding: 20px;
          border-bottom: 1px solid #F5F5F5;
          color: #333333 !important;
          background-color: #ffffff !important;
          font-size: 15px;
        }
        
        .quotation-table tr:last-child td {
          border-bottom: 2px solid #000000;
        }
        
        .quotation-total-row td {
          font-weight: 600;
          font-size: 18px;
          background-color: #F9F9F9 !important;
          color: #000000 !important;
          border-top: 2px solid #000000;
          border-bottom: 2px solid #000000 !important;
        }
        
        .client-info {
          background-color: #FAFAFA !important;
          border: 1px solid #E5E7EB;
          padding: 32px;
          margin: 32px 0;
        }
        
        .client-info h3 {
          color: #000000 !important;
          font-size: 20px;
          font-weight: 400;
          margin: 0 0 24px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .info-label {
          color: #000000 !important;
          font-weight: 600 !important;
          font-size: 14px;
          display: block;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .info-value {
          color: #333333 !important;
          font-size: 16px;
          font-weight: 400;
          margin-bottom: 18px;
          line-height: 1.6;
        }
        
        .terms-heading {
          color: #000000 !important;
          font-weight: 600;
          font-size: 16px;
          margin: 32px 0 16px 0;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        
        .summary-row-label {
          font-weight: 500;
          color: #333333 !important;
        }
        
        /* Override any dark mode attempts */
        @media (prefers-color-scheme: dark) {
          .quotation-container,
          .quotation-container *,
          .quotation-table,
          .quotation-table *,
          .client-info,
          .client-info * {
            background-color: #ffffff !important;
            color: #333333 !important;
          }
          
          .quotation-table th {
            background-color: #000000 !important;
            color: #ffffff !important;
          }
          
          .quotation-total-row td {
            background-color: #F9F9F9 !important;
            color: #000000 !important;
          }
          
          .client-info {
            background-color: #FAFAFA !important;
          }
          
          .quotation-section-title {
            color: #000000 !important;
          }
          
          .info-label {
            color: #000000 !important;
          }
          
          .info-value {
            color: #333333 !important;
          }
          
          .terms-heading {
            color: #000000 !important;
          }
          
          .summary-row-label {
            color: #333333 !important;
          }
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    },
  },
];

export async function seedTemplates(organizationId: string, creatorId: string, forceReplace = false) {
  try {
    await connectDB();
    
    // Check if templates already exist for this organization
    const existingTemplates = await QuotationTemplateModel.countDocuments({ organization: organizationId });
    
    if (existingTemplates === 0 || forceReplace) {
      if (forceReplace && existingTemplates > 0) {
        // Delete existing templates
        await QuotationTemplateModel.deleteMany({ organization: organizationId });
        console.log(`🗑️  Deleted ${existingTemplates} existing templates for organization: ${organizationId}`);
      }
      
      // Create default templates for this organization
      const templatesWithOrg = prebuiltTemplates.map(template => ({
        ...template,
        organization: organizationId,
        creator: creatorId,
      }));
      
      await QuotationTemplateModel.insertMany(templatesWithOrg);
      console.log(`✅ Created ${prebuiltTemplates.length} professional templates for organization: ${organizationId}`);
    } else {
      console.log(`⚠️ Templates already exist for organization: ${organizationId} (${existingTemplates} templates found)`);
    }
  } catch (error) {
    console.error("Error seeding templates:", error);
    throw error;
  }
}