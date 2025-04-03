import QuotationTemplateModel from "@/models/quotationTemplateModel";
import connectDB from "@/lib/db";

const prebuiltTemplates = [
  // 1. Modern Blue (Enhanced)
  {
    name: "Modern Blue",
    description: "A clean, professional template with blue accents and minimal design",
    isDefault: true,
    previewImage: "/images/templates/modern-blue.jpg",
    layout: {
      header: {
        show: true,
        height: 120,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding: 25px 20px; background: linear-gradient(to right, #EFF6FF, #DBEAFE); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div>{{company_logo}}</div>
            <div>
              <h1 style="font-size: 26px; font-weight: 600; color: #2563EB; margin: 0 0 5px 0;">{{company_name}}</h1>
              <div style="font-size: 14px; color: #4B5563;">{{quotation_number}}</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 14px; color: #4B5563;">
            <div style="font-weight: 500;">{{date}}</div>
            <div>Valid until: {{valid_until}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6B7280; padding: 15px 0; border-top: 1px solid #E5E7EB;">
          <div>{{company_name}} • {{company_email}}</div>
          <div>Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#2563EB",
      secondaryColor: "#1E40AF",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #2563EB;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #DBEAFE;
        }
        .quotation-table {
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
        }
        .quotation-table th {
          background-color: #2563EB;
          color: white;
          font-weight: 500;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 12px 16px;
        }
        .quotation-table td {
          padding: 12px 16px;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F9FAFB;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #EFF6FF !important;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
  // 2. Executive Gray (Enhanced)
  {
    name: "Executive Gray",
    description: "A sophisticated, executive template with refined details",
    isDefault: false,
    previewImage: "/images/templates/executive-gray.jpg",
    layout: {
      header: {
        show: true,
        height: 110,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding: 0 0 20px 0; border-bottom: 2px solid #4B5563;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div>{{company_logo}}</div>
            <div>
              <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 6px 0;">{{company_name}}</h1>
              <div style="font-size: 13px; color: #6B7280; letter-spacing: 0.05em; text-transform: uppercase;">QUOTATION</div>
            </div>
          </div>
          <div style="text-align: right; background-color: #F3F4F6; padding: 12px 16px; border-radius: 6px;">
            <div style="font-size: 13px; color: #374151; margin-bottom: 4px;"><span style="font-weight: 500;">Ref:</span> {{quotation_number}}</div>
            <div style="font-size: 13px; color: #374151;"><span style="font-weight: 500;">Date:</span> {{date}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 70,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; padding: 15px 0; border-top: 1px solid #E5E7EB;">
          <div>{{company_name}} • {{company_address}}</div>
          <div style="text-align: right;">
            <div>{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#4B5563",
      secondaryColor: "#374151",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #374151;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 14px;
          letter-spacing: 0.02em;
        }
        .quotation-table {
          border-collapse: collapse;
          width: 100%;
          border: none;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .quotation-table th {
          background-color: #F3F4F6;
          color: #374151;
          font-weight: 600;
          padding: 14px 16px;
          border-top: 1px solid #E5E7EB;
          border-bottom: 1px solid #D1D5DB;
          text-align: left;
          font-size: 12px;
        }
        .quotation-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #E5E7EB;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #F9FAFB !important;
        }
        .client-info {
          background-color: #F9FAFB;
          border-radius: 6px;
          padding: 16px;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
  // 3. Bold Green (Enhanced)
  {
    name: "Bold Green",
    description: "A vibrant, modern template with green accents and clean typography",
    isDefault: false,
    previewImage: "/images/templates/bold-green.jpg",
    layout: {
      header: {
        show: true,
        height: 150,
        content: `<div style="background: linear-gradient(to right, #059669, #10B981); color: white; padding: 25px; border-radius: 8px; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="background: rgba(255,255,255,0.15); padding: 10px; border-radius: 8px;">{{company_logo}}</div>
              <div>
                <h1 style="font-size: 28px; margin: 0 0 10px 0; font-weight: 600;">{{company_name}}</h1>
                <div style="font-size: 15px; opacity: 0.9;">{{company_tagline}}</div>
              </div>
            </div>
            <div style="text-align: right; background-color: rgba(255,255,255,0.15); padding: 12px 18px; border-radius: 8px;">
              <div style="font-size: 13px; margin-bottom: 4px;">Quotation: {{quotation_number}}</div>
              <div style="font-size: 13px;">Date: {{date}}</div>
            </div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="border-top: 1px solid #D1FAE5; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 12px; color: #059669;">
            <div style="font-weight: 500;">{{company_name}}</div>
            <div style="margin-top: 4px; color: #6B7280;">{{company_address}}</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #6B7280;">
            <div>{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#059669",
      secondaryColor: "#065F46",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #059669;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #D1FAE5;
        }
        .quotation-table {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
        }
        .quotation-table th {
          background-color: #059669;
          color: white;
          font-weight: 500;
          padding: 14px 16px;
          text-align: left;
        }
        .quotation-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #E5E7EB;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F9FAFB;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #ECFDF5 !important;
        }
        .client-info {
          background-color: #F9FAFB;
          border-radius: 8px;
          padding: 18px;
          border-left: 4px solid #059669;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
 // 4. Violet Edge
 {
  name: "Violet Edge",
  description: "A premium template with violet accents and modern asymmetric design",
  isDefault: false,
  previewImage: "/images/templates/violet-edge.jpg",
  layout: {
    header: {
      show: true,
      height: 140,
      content: `<div style="position: relative; padding: 25px 20px;">
        <div style="position: absolute; top: 0; left: 0; width: 35%; height: 100%; background-color: #8B5CF6; border-radius: 8px;"></div>
        <div style="position: relative; display: flex; justify-content: space-between;">
          <div style="padding: 15px; color: white; display: flex; align-items: center; gap: 15px;">
            <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px;">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 26px; font-weight: 600; margin: 0 0 8px 0;">{{company_name}}</h1>
              <div style="font-size: 14px; opacity: 0.9;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="background-color: #F5F3FF; padding: 15px; border-radius: 8px; text-align: right;">
            <div style="font-size: 13px; color: #6D28D9; font-weight: 600; margin-bottom: 4px;">QUOTATION {{quotation_number}}</div>
            <div style="font-size: 13px; color: #4B5563;">Issued: {{date}}</div>
            <div style="font-size: 13px; color: #4B5563;">Valid until: {{valid_until}}</div>
          </div>
        </div>
      </div>`,
    },
    footer: {
      show: true,
      height: 70,
      content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; padding-top: 15px; border-top: 1px solid #E5E7EB;">
        <div>
          <div style="color: #7C3AED; font-weight: 500;">{{company_name}}</div>
          <div style="margin-top: 4px;">{{company_address}}</div>
        </div>
        <div style="text-align: right;">
          <div>{{company_email}} • {{company_phone}}</div>
          <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
    ],
  },
  styles: {
    primaryColor: "#8B5CF6",
    secondaryColor: "#6D28D9",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "13px",
    borderStyle: "solid",
    tableBorders: true,
    alternateRowColors: true,
    customCSS: `
      .quotation-section-title {
        color: #8B5CF6;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 14px;
        padding-bottom: 8px;
        position: relative;
      }
      .quotation-section-title:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 60px;
        height: 3px;
        background-color: #8B5CF6;
        border-radius: 3px;
      }
      .quotation-table {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      }
      .quotation-table th {
        background: linear-gradient(to right, #8B5CF6, #7C3AED);
        color: white;
        font-weight: 500;
        padding: 14px 16px;
        text-align: left;
        font-size: 12px;
      }
      .quotation-table td {
        padding: 14px 16px;
        border-bottom: 1px solid #E5E7EB;
      }
      .quotation-table tr:last-child td {
        border-bottom: none;
      }
      .quotation-table tr:nth-child(even) {
        background-color: #F5F3FF;
      }
      .quotation-total-row {
        font-weight: 600;
        background-color: #EDE9FE !important;
      }
      .client-info {
        background-color: #F5F3FF;
        border-radius: 8px;
        padding: 18px;
      }
    `,
  },
  pageSettings: {
    pageSize: "A4",
    orientation: "portrait",
    margins: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
  },
},

// 5. Amber Elegance
{
  name: "Amber Elegance",
  description: "A warm, elegant template with amber and gold accents",
  isDefault: false,
  previewImage: "/images/templates/amber-elegance.jpg",
  layout: {
    header: {
      show: true,
      height: 150,
      content: `<div style="text-align: center; padding: 20px 0;">
        <div style="margin-bottom: 15px;">{{company_logo}}</div>
        <h1 style="font-size: 28px; font-weight: 600; color: #D97706; margin: 0 0 5px 0;">{{company_name}}</h1>
        <div style="font-size: 14px; color: #78350F; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 15px;">Professional Quotation</div>
        <div style="display: inline-block; padding: 8px 20px; background-color: #FEF3C7; border-radius: 20px; font-size: 13px; color: #92400E;">
          <span style="font-weight: 500;">{{quotation_number}}</span> • Issued: {{date}} • Valid until: {{valid_until}}
        </div>
      </div>`,
    },
    footer: {
      show: true,
      height: 70,
      content: `<div style="text-align: center; font-size: 12px; color: #92400E; padding-top: 15px; border-top: 1px solid #FDE68A;">
        <div>{{company_name}} • {{company_address}} • {{company_email}} • {{company_phone}}</div>
        <div style="margin-top: 8px; color: #B45309;">Thank you for your business</div>
        <div style="margin-top: 4px; font-size: 11px; color: #78350F;">Page {{page_number}} of {{total_pages}}</div>
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
    ],
  },
  styles: {
    primaryColor: "#D97706",
    secondaryColor: "#92400E",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "13px",
    borderStyle: "solid",
    tableBorders: true,
    alternateRowColors: true,
    customCSS: `
      .quotation-section-title {
        color: #B45309;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 15px;
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 1px dashed #FDE68A;
      }
      .quotation-table {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #FDE68A;
      }
      .quotation-table th {
        background-color: #B45309;
        color: white;
        font-weight: 500;
        padding: 14px 16px;
        text-align: left;
      }
      .quotation-table td {
        padding: 14px 16px;
        border-bottom: 1px solid #FEF3C7;
      }
      .quotation-table tr:last-child td {
        border-bottom: none;
      }
      .quotation-table tr:nth-child(even) {
        background-color: #FFFBEB;
      }
      .quotation-total-row {
        font-weight: 600;
        background-color: #FEF3C7 !important;
        color: #92400E;
      }
      .client-info {
        background-color: #FFFBEB;
        border-radius: 8px;
        padding: 18px;
        border: 1px solid #FDE68A;
      }
    `,
  },
  pageSettings: {
    pageSize: "A4",
    orientation: "portrait",
    margins: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
  },
},

// 6. Slate Professional
{
  name: "Slate Professional",
  description: "A sophisticated dark slate template with modern contrast",
  isDefault: false,
  previewImage: "/images/templates/slate-professional.jpg",
  layout: {
    header: {
      show: true,
      height: 130,
      content: `<div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background-color: #1E293B; color: white; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div>{{company_logo}}</div>
          <div>
            <h1 style="font-size: 26px; font-weight: 600; margin: 0 0 6px 0;">{{company_name}}</h1>
            <div style="font-size: 13px; color: #94A3B8;">{{company_tagline}}</div>
          </div>
        </div>
        <div style="text-align: right; background-color: #334155; padding: 14px; border-radius: 6px;">
          <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 5px;">QUOTATION</div>
          <div style="font-size: 14px; font-weight: 500;">{{quotation_number}}</div>
          <div style="font-size: 12px; color: #94A3B8; margin-top: 5px;">{{date}}</div>
        </div>
      </div>`,
    },
    footer: {
      show: true,
      height: 70,
      content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748B; padding-top: 15px; border-top: 1px solid #E2E8F0;">
        <div>
          <div style="font-weight: 500;">{{company_name}}</div>
          <div style="margin-top: 3px;">{{company_address}}</div>
        </div>
        <div style="text-align: right;">
          <div>{{company_email}} • {{company_phone}}</div>
          <div style="margin-top: 3px;">Page {{page_number}} of {{total_pages}}</div>
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
    ],
  },
  styles: {
    primaryColor: "#1E293B",
    secondaryColor: "#334155",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "13px",
    borderStyle: "solid",
    tableBorders: true,
    alternateRowColors: true,
    customCSS: `
      .quotation-section-title {
        color: #1E293B;
        font-size: 15px;
        font-weight: 600;
        margin-bottom: 14px;
        padding-bottom: 8px;
        border-bottom: 2px solid #E2E8F0;
      }
      .quotation-table {
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .quotation-table th {
        background-color: #1E293B;
        color: white;
        font-weight: 500;
        padding: 14px 16px;
        text-align: left;
      }
      .quotation-table td {
        padding: 14px 16px;
        border-bottom: 1px solid #E2E8F0;
      }
      .quotation-table tr:last-child td {
        border-bottom: none;
      }
        .quotation-table tr:nth-child(even) {
          background-color: #F8FAFC;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #F1F5F9 !important;
        }
        .client-info {
          background-color: #F8FAFC;
          border-radius: 6px;
          padding: 16px;
          border-left: 3px solid #1E293B;
        }`
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
  // 7. Rose Gradient
  {
    name: "Rose Gradient",
    description: "A modern template with elegant rose gradient accents",
    isDefault: false,
    previewImage: "/images/templates/rose-gradient.jpg",
    layout: {
      header: {
        show: true,
        height: 140,
        content: `<div style="background: linear-gradient(to right, #BE185D, #EC4899); padding: 25px; border-radius: 10px; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="background: rgba(255,255,255,0.15); padding: 8px; border-radius: 6px;">{{company_logo}}</div>
              <div>
                <h1 style="font-size: 26px; font-weight: 600; margin: 0 0 8px 0;">{{company_name}}</h1>
                <div style="font-size: 14px; opacity: 0.9;">{{company_tagline}}</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="display: inline-block; background-color: rgba(255,255,255,0.15); padding: 10px 15px; border-radius: 6px;">
                <div style="font-size: 12px; margin-bottom: 3px;">QUOTATION {{quotation_number}}</div>
                <div style="font-size: 12px;">{{date}}</div>
              </div>
            </div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 70,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; padding-top: 15px; border-top: 1px solid #FBCFE8;">
          <div>
            <div style="color: #BE185D; font-weight: 500;">{{company_name}}</div>
            <div style="margin-top: 4px;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div>{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#BE185D",
      secondaryColor: "#9D174D",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #BE185D;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid #FBCFE8;
        }
        .quotation-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .quotation-table th {
          background: linear-gradient(to right, #BE185D, #DB2777);
          color: white;
          font-weight: 500;
          padding: 14px 16px;
          text-align: left;
        }
        .quotation-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #FCE7F3;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #FDF2F8;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #FCE7F3 !important;
        }
        .client-info {
          background-color: #FDF2F8;
          border-radius: 8px;
          padding: 18px;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
  // 8. Cyan Modern
  {
    name: "Cyan Modern",
    description: "A fresh, modern template with cyan accents and clean layout",
    isDefault: false,
    previewImage: "/images/templates/cyan-modern.jpg",
    layout: {
      header: {
        show: true,
        height: 140,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 2px solid #CFFAFE;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div>{{company_logo}}</div>
            <div>
              <h1 style="font-size: 28px; font-weight: 600; color: #0E7490; margin: 0 0 6px 0;">{{company_name}}</h1>
              <div style="font-size: 14px; color: #0891B2;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="background-color: #ECFEFF; padding: 15px; border-radius: 10px; text-align: right;">
            <div style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px; color: #0E7490; margin-bottom: 5px;">Quotation</div>
            <div style="font-size: 15px; color: #164E63; font-weight: 600;">{{quotation_number}}</div>
            <div style="font-size: 12px; color: #0E7490; margin-top: 5px;">{{date}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 70,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; padding-top: 15px; border-top: 1px solid #CFFAFE;">
          <div>
            <div style="color: #0E7490; font-weight: 500;">{{company_name}}</div>
            <div style="margin-top: 4px;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div>{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#0E7490",
      secondaryColor: "#155E75",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #0E7490;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 14px;
          position: relative;
          padding-left: 12px;
        }
        .quotation-section-title:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background-color: #06B6D4;
          border-radius: 2px;
        }
        .quotation-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .quotation-table th {
          background-color: #0E7490;
          color: white;
          font-weight: 500;
          padding: 14px 16px;
          text-align: left;
        }
        .quotation-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #E5E7EB;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F0FDFA;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #ECFEFF !important;
        }
        .client-info {
          background-color: #F0FDFA;
          border-radius: 8px;
          padding: 18px;
          border: 1px solid #A5F3FC;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
  // 9. Indigo Blocks
  {
    name: "Indigo Blocks",
    description: "A bold, structured template with indigo accents and block elements",
    isDefault: false,
    previewImage: "/images/templates/indigo-blocks.jpg",
    layout: {
      header: {
        show: true,
        height: 150,
        content: `<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          <div style="background-color: #4F46E5; color: white; padding: 25px; border-radius: 10px; display: flex; align-items: center; gap: 20px;">
            <div style="background: rgba(255,255,255,0.15); padding: 10px; border-radius: 8px;">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 26px; font-weight: 600; margin: 0 0 10px 0;">{{company_name}}</h1>
              <div style="font-size: 14px; opacity: 0.9;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background-color: #EEF2FF; padding: 15px; border-radius: 10px;">
              <div style="font-size: 12px; color: #4F46E5; margin-bottom: 3px;">QUOTATION</div>
              <div style="font-size: 15px; color: #312E81; font-weight: 600;">{{quotation_number}}</div>
            </div>
            <div style="background-color: #EEF2FF; padding: 15px; border-radius: 10px;">
              <div style="font-size: 12px; color: #4F46E5; margin-bottom: 3px;">DATE</div>
              <div style="font-size: 15px; color: #312E81; font-weight: 500;">{{date}}</div>
            </div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 70,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; padding-top: 15px; border-top: 1px solid #C7D2FE;">
          <div>
            <div style="color: #4F46E5; font-weight: 500;">{{company_name}}</div>
            <div style="margin-top: 4px;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div>{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#4F46E5",
      secondaryColor: "#4338CA",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #4F46E5;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
          background-color: #EEF2FF;
          padding: 10px 15px;
          border-radius: 6px;
        }
        .quotation-table {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .quotation-table th {
          background-color: #4F46E5;
          color: white;
          font-weight: 500;
          padding: 14px 16px;
          text-align: left;
        }
        .quotation-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #E0E7FF;
        }
       .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #EEF2FF;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #E0E7FF !important;
        }
        .client-info {
          background-color: #EEF2FF;
          border-radius: 10px;
          padding: 18px;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
  // 10. Minimal Black
  {
    name: "Minimal Black",
    description: "A premium minimalist template with sophisticated black accents",
    isDefault: false,
    previewImage: "/images/templates/minimal-black.jpg",
    layout: {
      header: {
        show: true,
        height: 130,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid #E5E7EB;">
          <div style="display: flex; align-items: center; gap: 25px;">
            <div>{{company_logo}}</div>
            <div>
              <h1 style="font-size: 26px; font-weight: 700; color: #111827; margin: 0 0 5px 0; letter-spacing: -0.02em;">{{company_name}}</h1>
              <div style="font-size: 14px; color: #4B5563;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: #111827; margin-bottom: 5px; font-weight: 600;">Quotation</div>
            <div style="font-size: 15px; color: #111827; font-weight: 500;">{{quotation_number}}</div>
            <div style="font-size: 12px; color: #6B7280; margin-top: 5px;">{{date}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 70,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; padding-top: 15px; border-top: 1px solid #E5E7EB;">
          <div>
            <div style="color: #111827; font-weight: 500;">{{company_name}}</div>
            <div style="margin-top: 4px;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div>{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#111827",
      secondaryColor: "#374151",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #111827;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 16px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-size: 12px;
        }
        .quotation-table {
          width: 100%;
          border-collapse: collapse;
        }
        .quotation-table th {
          background-color: #111827;
          color: white;
          font-weight: 500;
          padding: 12px 16px;
          text-align: left;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .quotation-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #F3F4F6;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F9FAFB;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #F3F4F6 !important;
        }
        .client-info {
          background-color: #F9FAFB;
          padding: 20px;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
  // 11. Orange Accent
  {
    name: "Orange Accent",
    description: "A vibrant template with orange accents and modern layout",
    isDefault: false,
    previewImage: "/images/templates/orange-accent.jpg",
    layout: {
      header: {
        show: true,
        height: 140,
        content: `<div style="position: relative; padding: 20px; background-color: #FFEDD5; border-radius: 10px; overflow: hidden;">
          <div style="position: absolute; top: 0; right: 0; width: 40%; height: 100%; background-color: #F97316; clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);"></div>
          <div style="position: relative; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">{{company_logo}}</div>
              <div>
                <h1 style="font-size: 26px; font-weight: 600; color: #C2410C; margin: 0 0 8px 0;">{{company_name}}</h1>
                <div style="font-size: 14px; color: #9A3412;">{{company_tagline}}</div>
              </div>
            </div>
            <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: right; z-index: 10; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 12px; color: #C2410C; margin-bottom: 5px;">QUOTATION</div>
              <div style="font-size: 15px; color: #9A3412; font-weight: 600;">{{quotation_number}}</div>
              <div style="font-size: 12px; color: #C2410C; margin-top: 5px;">{{date}}</div>
            </div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 70,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; padding-top: 15px; border-top: 1px solid #FFEDD5;">
          <div>
            <div style="color: #C2410C; font-weight: 500;">{{company_name}}</div>
            <div style="margin-top: 4px;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div>{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#F97316",
      secondaryColor: "#C2410C",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #C2410C;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 2px solid #FFEDD5;
        }
        .quotation-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .quotation-table th {
          background-color: #F97316;
          color: white;
          font-weight: 500;
          padding: 14px 16px;
          text-align: left;
        }
        .quotation-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #FED7AA;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #FFF7ED;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #FFEDD5 !important;
        }
        .client-info {
          background-color: #FFF7ED;
          border-radius: 8px;
          padding: 18px;
          border-left: 4px solid #F97316;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
  
  // 12. Teal Waves
  {
    name: "Teal Waves",
    description: "A soothing template with teal accents and wave patterns",
    isDefault: false,
    previewImage: "/images/templates/teal-waves.jpg",
    layout: {
      header: {
        show: true,
        height: 150,
        content: `<div style="position: relative; padding: 25px; background-color: #CCFBF1; border-radius: 10px; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.4; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDI1QzIwIDI1IDIwIDc1IDQwIDc1QzYwIDc1IDYwIDI1IDgwIDI1QzEwMCAyNSAxMDAgNzUgMTIwIDc1QzE0MCA3NSAxNDAgMjUgMTYwIDI1QzE4MCAyNSAxODAgNzUgMjAwIDc1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRDk0ODgiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+PC9zdmc+');"></div>
         <div style="position: relative; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">{{company_logo}}</div>
              <div>
                <h1 style="font-size: 26px; font-weight: 600; color: #0F766E; margin: 0 0 8px 0;">{{company_name}}</h1>
                <div style="font-size: 14px; color: #115E59;">{{company_tagline}}</div>
              </div>
            </div>
            <div style="background-color: white; padding: 15px; border-radius: 8px; text-align: right; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 12px; color: #0F766E; margin-bottom: 5px;">QUOTATION</div>
              <div style="font-size: 15px; color: #134E4A; font-weight: 600;">{{quotation_number}}</div>
              <div style="font-size: 12px; color: #0F766E; margin-top: 5px;">{{date}}</div>
            </div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 70,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #6B7280; padding-top: 15px; border-top: 1px solid #99F6E4;">
          <div>
            <div style="color: #0F766E; font-weight: 500;">{{company_name}}</div>
            <div style="margin-top: 4px;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div>{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px;">Page {{page_number}} of {{total_pages}}</div>
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
      ],
    },
    styles: {
      primaryColor: "#0F766E",
      secondaryColor: "#115E59",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      borderStyle: "solid",
      tableBorders: true,
      alternateRowColors: true,
      customCSS: `
        .quotation-section-title {
          color: #0F766E;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 14px;
          padding-bottom: 8px;
          border-bottom: 2px solid #99F6E4;
        }
        .quotation-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .quotation-table th {
          background-color: #0F766E;
          color: white;
          font-weight: 500;
          padding: 14px 16px;
          text-align: left;
        }
        .quotation-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #CCFBF1;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F0FDFA;
        }
        .quotation-total-row {
          font-weight: 600;
          background-color: #CCFBF1 !important;
        }
        .client-info {
          background-color: #F0FDFA;
          border-radius: 8px;
          padding: 18px;
          border: 1px solid #99F6E4;
        }
      `,
    },
    pageSettings: {
      pageSize: "A4",
      orientation: "portrait",
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
      },
    },
  },
];

export async function seedTemplates(organizationId: string, creatorId: string) {
  try {
    await connectDB();
    
    // Check if templates already exist for this organization
    const existingTemplates = await QuotationTemplateModel.countDocuments({ organization: organizationId });
    
    if (existingTemplates === 0) {
      // Create default templates for this organization
      const templatesWithOrg = prebuiltTemplates.map(template => ({
        ...template,
        organization: organizationId,
        creator: creatorId,
      }));
      
      await QuotationTemplateModel.insertMany(templatesWithOrg);
      console.log(`✅ Default templates created for organization: ${organizationId}`);
    }
  } catch (error) {
    console.error("Error seeding templates:", error);
  }
}