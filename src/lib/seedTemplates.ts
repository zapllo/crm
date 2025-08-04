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
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding: 25px 20px; background: linear-gradient(to right, #EFF6FF, #DBEAFE); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="padding: 8px; background: rgba(255,255,255,0.7); border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 28px; font-weight: 800; color: #1E40AF; margin: 0 0 5px 0; letter-spacing: -0.02em;">{{company_name}}</h1>
              <div style="font-size: 14px; color: #2563EB; font-weight: 600;">{{quotation_number}}</div>
            </div>
          </div>
          <div style="text-align: right; background-color: rgba(255,255,255,0.7); padding: 12px 16px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <div style="font-weight: 700; color: #1E40AF; font-size: 14px;">{{date}}</div>
            <div style="color: #2563EB; font-weight: 600;">Valid until: {{valid_until}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #4B5563; padding: 15px 0; border-top: 1px solid #E5E7EB;">
          <div style="font-weight: 600;">{{company_name}} • {{company_email}}</div>
          <div style="font-weight: 600;">Page {{page_number}} of {{total_pages}}</div>
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
          color: #1E40AF;
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 2px solid #DBEAFE;
          letter-spacing: -0.01em;
        }
        .quotation-table {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #E5E7EB;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .quotation-table th {
          background-color: #1E40AF;
          color: white;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
          padding: 14px 16px;
        }
        .quotation-table td {
          padding: 14px 16px;
          color: #374151;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F9FAFB;
        }
        .quotation-total-row {
          font-weight: 800;
          background-color: #EFF6FF !important;
          color: #1E40AF !important;
        }
        .client-info {
          background-color: #F8FAFC;
          border-radius: 8px;
          padding: 20px;
          border-left: 4px solid #2563EB;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }
        
        /* Enhanced client info styling for bold labels */
        .client-info div > strong, 
        .client-info .label,
        .client-info .heading,
        .client-info label,
        .client-info .info-label,
        .client-info b {
          color: #1E3A8A;
          font-weight: 800 !important; 
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          letter-spacing: -0.01em;
        }
        .client-info .value,
        .client-info .info-value {
          color: #374151;
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 14px;
        }
        
        /* Terms section styling */
        .terms-heading {
          font-weight: 700;
          color: #1E40AF;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        /* Summary section styling */
        .summary-row-label {
          font-weight: 700;
          color: #1E40AF;
        }
        .summary-total {
          font-weight: 800;
          color: #1E40AF;
          font-size: 16px;
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
  
  // 2. Slate Professional (Enhanced)
  {
    name: "Slate Professional",
    description: "A sophisticated dark slate template with modern contrast",
    isDefault: false,
    previewImage: "/images/templates/slate-professional.jpg",
    layout: {
      header: {
        show: true,
        height: 140,
        content: `<div class="dark-header" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; background-color: #1E293B; color: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; gap: 22px;">
            <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.02em; color: white;">{{company_name}}</h1>
              <div style="font-size: 14px; color: #CBD5E1; font-weight: 600;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="text-align: right; background-color: #334155; padding: 16px 18px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            <div style="font-size: 12px; color: #CBD5E1; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">QUOTATION</div>
            <div style="font-size: 16px; font-weight: 700; color: white;">{{quotation_number}}</div>
            <div style="font-size: 12px; color: #94A3B8; margin-top: 6px; font-weight: 600;">{{date}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; padding-top: 15px; border-top: 1px solid #E2E8F0;">
          <div>
            <div style="font-weight: 700; color: #1E293B;">{{company_name}}</div>
            <div style="margin-top: 4px; font-weight: 600;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600;">{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px; font-weight: 600;">Page {{page_number}} of {{total_pages}}</div>
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
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 2px solid #E2E8F0;
          letter-spacing: -0.01em;
        }
        .quotation-table {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
        }
        .quotation-table th {
          background-color: #1E293B;
          color: white;
          font-weight: 700;
          padding: 16px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .quotation-table td {
          padding: 16px;
          border-bottom: 1px solid #E2E8F0;
          color: #1E293B;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F8FAFC;
        }
        .quotation-total-row {
          font-weight: 800;
          background-color: #F1F5F9 !important;
          color: #1E293B !important;
        }
        .client-info {
          background-color: #F8FAFC;
          border-radius: 8px;
          padding: 20px;
          border-left: 4px solid #1E293B;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }
        
        /* Enhanced client info styling for bold labels */
        .client-info div > strong, 
        .client-info .label,
        .client-info .heading,
        .client-info label,
        .client-info .info-label,
        .client-info b {
          color: #0F172A;
          font-weight: 800 !important; 
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          letter-spacing: -0.01em;
        }
        .client-info .value,
        .client-info .info-value {
          color: #334155;
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 14px;
        }
        
        /* Terms section styling */
        .terms-heading {
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        /* Summary section styling */
        .summary-row-label {
          font-weight: 700;
          color: #1E293B;
        }
        .summary-total {
          font-weight: 800;
          color: #1E293B;
          font-size: 16px;
        }
        
        /* Fix for dark backgrounds */
        .dark-header h1, 
        .dark-header div {
          color: white !important;
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
        content: `<div class="header-container" style="background: linear-gradient(to right, #047857, #10B981); color: white; padding: 25px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 30px; margin: 0 0 10px 0; font-weight: 800; letter-spacing: -0.02em; color: white;">{{company_name}}</h1>
              <div class="company-tagline" style="font-size: 15px; opacity: 0.95; font-weight: 600; color: white;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="text-align: right; background-color: rgba(255,255,255,0.2); padding: 16px 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-size: 14px; margin-bottom: 6px; font-weight: 700; color: white;">Quotation: {{quotation_number}}</div>
            <div style="font-size: 14px; font-weight: 600; color: white;">Date: {{date}}</div>
          </div>
        </div>
      </div>`,
    },
    footer: {
      show: true,
      height: 80,
      content: `<div style="border-top: 1px solid #D1FAE5; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12px; color: #059669;">
          <div style="font-weight: 700;">{{company_name}}</div>
          <div style="margin-top: 4px; color: #374151; font-weight: 600;">{{company_address}}</div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #374151;">
          <div style="font-weight: 600;">{{company_email}} • {{company_phone}}</div>
          <div style="margin-top: 4px; font-weight: 600;">Page {{page_number}} of {{total_pages}}</div>
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
    secondaryColor: "#047857",
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "13px",
    borderStyle: "solid",
    tableBorders: true,
    alternateRowColors: true,
    customCSS: `
      .quotation-section-title {
        color: #047857;
        font-size: 18px;
        font-weight: 800;
        margin-bottom: 18px;
        padding-bottom: 10px;
        border-bottom: 2px solid #A7F3D0;
        letter-spacing: -0.01em;
      }
      .quotation-table {
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #D1FAE5;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .quotation-table th {
        background-color: #059669;
        color: white;
        font-weight: 700;
        padding: 16px;
        text-align: left;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .quotation-table td {
        padding: 16px;
        border-bottom: 1px solid #D1FAE5;
        color: #1F2937;
      }
      .quotation-table tr:last-child td {
        border-bottom: none;
      }
      .quotation-table tr:nth-child(even) {
        background-color: #ECFDF5;
      }
      .quotation-total-row {
        font-weight: 800;
        background-color: #D1FAE5 !important;
        color: #065F46 !important;
      }
      .client-info {
        background-color: #ECFDF5;
        border-radius: 10px;
        padding: 20px;
        border-left: 5px solid #059669;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        margin-bottom: 24px;
      }
      
      /* Enhanced client info styling for bold labels */
      .client-info div > strong, 
      .client-info .label,
      .client-info .heading,
      .client-info label,
      .client-info .info-label,
      .client-info b {
        color: #065F46;
        font-weight: 800 !important; 
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        letter-spacing: -0.01em;
      }
      .client-info .value,
      .client-info .info-value {
        color: #1F2937;
        margin-bottom: 16px;
        font-weight: 500;
        font-size: 14px;
      }
      
      /* Terms section styling */
      .terms-heading {
        font-weight: 700;
        color: #065F46;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      /* Summary section styling */
      .summary-row-label {
        font-weight: 700;
        color: #065F46;
      }
      .summary-total {
        font-weight: 800;
        color: #065F46;
        font-size: 16px;
      }
      
      /* Fix for white text in header */
      .header-container h1, 
      .header-container .company-tagline,
      .header-container div {
        color: white !important;
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

// 4. Violet Edge (Enhanced)
{
  name: "Violet Edge",
  description: "A premium template with violet accents and modern asymmetric design",
  isDefault: false,
  previewImage: "/images/templates/violet-edge.jpg",
  layout: {
    header: {
      show: true,
      height: 150,
      content: `<div class="header-content" style="position: relative; padding: 25px 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.08); border-radius: 10px; margin-bottom: 5px;">
        <div style="position: absolute; top: 0; left: 0; width: 35%; height: 100%; background-color: #7C3AED; border-radius: 10px; box-shadow: 4px 0 8px -2px rgba(0,0,0,0.1);"></div>
        <div style="position: relative; display: flex; justify-content: space-between;">
          <div style="padding: 15px; color: white; display: flex; align-items: center; gap: 15px;">
            <div style="background: rgba(255,255,255,0.25); padding: 12px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.02em; color: white;">{{company_name}}</h1>
              <div style="font-size: 14px; opacity: 0.95; font-weight: 600; color: white;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="background-color: #F5F3FF; padding: 16px; border-radius: 10px; text-align: right; box-shadow: 0 3px 6px rgba(0,0,0,0.07);">
            <div style="font-size: 13px; color: #6D28D9; font-weight: 800; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">QUOTATION {{quotation_number}}</div>
            <div style="font-size: 13px; color: #4B5563; font-weight: 600;">Issued: {{date}}</div>
            <div style="font-size: 13px; color: #4B5563; font-weight: 600;">Valid until: {{valid_until}}</div>
          </div>
        </div>
      </div>`,
    },
    footer: {
      show: true,
      height: 70,
      content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #4B5563; padding-top: 15px; border-top: 1px solid #E5E7EB;">
        <div>
          <div style="color: #7C3AED; font-weight: 700;">{{company_name}}</div>
          <div style="margin-top: 4px; font-weight: 600;">{{company_address}}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 600;">{{company_email}} • {{company_phone}}</div>
          <div style="margin-top: 4px; font-weight: 600;">Page {{page_number}} of {{total_pages}}</div>
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
        color: #6D28D9;
        font-size: 18px;
        font-weight: 800;
        margin-bottom: 16px;
        padding-bottom: 10px;
        position: relative;
        letter-spacing: -0.01em;
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
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.06);
      }
      .quotation-table th {
        background: linear-gradient(to right, #8B5CF6, #7C3AED);
        color: white;
        font-weight: 700;
        padding: 16px;
        text-align: left;
        font-size: 12px;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }
      .quotation-table td {
        padding: 16px;
        border-bottom: 1px solid #E5E7EB;
        color: #1F2937;
      }
      .quotation-table tr:last-child td {
        border-bottom: none;
      }
      .quotation-table tr:nth-child(even) {
        background-color: #F5F3FF;
      }
      .quotation-total-row {
        font-weight: 800;
        background-color: #EDE9FE !important;
        color: #5B21B6 !important;
      }
      .client-info {
        background-color: #F5F3FF;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        margin-bottom: 24px;
      }
      
      /* Enhanced client info styling for bold labels */
      .client-info div > strong, 
      .client-info .label,
      .client-info .heading,
      .client-info label,
      .client-info .info-label,
      .client-info b {
        color: #6D28D9;
        font-weight: 800 !important; 
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        letter-spacing: -0.01em;
      }
      .client-info .value,
      .client-info .info-value {
        color: #1F2937;
        margin-bottom: 16px;
        font-weight: 500;
        font-size: 14px;
      }
      
      /* Terms section styling */
      .terms-heading {
        font-weight: 700;
        color: #6D28D9;
        margin-bottom: 8px;
        font-size: 14px;
      }
      
      /* Summary section styling */
      .summary-row-label {
        font-weight: 700;
    color: #6D28D9;
        }
        .summary-total {
          font-weight: 800;
          color: #6D28D9;
          font-size: 16px;
        }
        
        /* Fix for white text in header */
        .header-content h1, 
        .header-content div {
          color: white !important;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
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
  
  // 5. Amber Elegance (Enhanced)
  {
    name: "Amber Elegance",
    description: "A warm, elegant template with amber and gold accents",
    isDefault: false,
    previewImage: "/images/templates/amber-elegance.jpg",
    layout: {
      header: {
        show: true,
        height: 160,
        content: `<div style="text-align: center; padding: 20px 0;">
          <div style="margin-bottom: 15px; background-color: #FFFBEB; display: inline-block; padding: 12px; border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">{{company_logo}}</div>
          <h1 style="font-size: 30px; font-weight: 800; color: #B45309; margin: 0 0 8px 0; letter-spacing: -0.01em;">{{company_name}}</h1>
          <div style="font-size: 14px; color: #92400E; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 15px; font-weight: 700;">Professional Quotation</div>
          <div style="display: inline-block; padding: 10px 22px; background-color: #FEF3C7; border-radius: 20px; font-size: 13px; color: #92400E; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <span style="font-weight: 800;">{{quotation_number}}</span> • Issued: {{date}} • Valid until: {{valid_until}}
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="text-align: center; font-size: 12px; color: #92400E; padding-top: 15px; border-top: 1px solid #FDE68A;">
          <div style="font-weight: 600;">{{company_name}} • {{company_address}} • {{company_email}} • {{company_phone}}</div>
          <div style="margin-top: 8px; color: #B45309; font-weight: 700;">Thank you for your business</div>
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
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 16px;
          text-align: center;
          padding-bottom: 12px;
          border-bottom: 1px dashed #FDE68A;
          letter-spacing: -0.01em;
        }
        .quotation-table {
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #FDE68A;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .quotation-table th {
          background-color: #B45309;
          color: white;
          font-weight: 700;
          padding: 16px;
          text-align: left;
          font-size: 12px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .quotation-table td {
          padding: 16px;
          border-bottom: 1px solid #FEF3C7;
          color: #1F2937;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #FFFBEB;
        }
        .quotation-total-row {
          font-weight: 800;
          background-color: #FEF3C7 !important;
          color: #92400E !important;
        }
        .client-info {
          background-color: #FFFBEB;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #FDE68A;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }
        
        /* Enhanced client info styling for bold labels */
        .client-info div > strong, 
        .client-info .label,
        .client-info .heading,
        .client-info label,
        .client-info .info-label,
        .client-info b {
          color: #92400E;
          font-weight: 800 !important; 
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          letter-spacing: -0.01em;
        }
        .client-info .value,
        .client-info .info-value {
          color: #1F2937;
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 14px;
        }
        
        /* Terms section styling */
        .terms-heading {
          font-weight: 700;
          color: #92400E;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        /* Summary section styling */
        .summary-row-label {
          font-weight: 700;
          color: #92400E;
        }
        .summary-total {
          font-weight: 800;
          color: #92400E;
          font-size: 16px;
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
  
  // 6. Indigo Blocks (Enhanced)
  {
    name: "Indigo Blocks",
    description: "A bold, structured template with indigo accents and block elements",
    isDefault: false,
    previewImage: "/images/templates/indigo-blocks.jpg",
    layout: {
      header: {
        show: true,
        height: 160,
        content: `<div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          <div class="indigo-header" style="background-color: #4F46E5; color: white; padding: 25px; border-radius: 10px; display: flex; align-items: center; gap: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: rgba(255,255,255,0.2); padding: 12px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.02em; color: white;">{{company_name}}</h1>
              <div style="font-size: 14px; opacity: 0.95; font-weight: 600; color: white;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background-color: #EEF2FF; padding: 16px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; color: #4F46E5; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">QUOTATION</div>
              <div style="font-size: 16px; color: #312E81; font-weight: 800;">{{quotation_number}}</div>
            </div>
            <div style="background-color: #EEF2FF; padding: 16px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; color: #4F46E5; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">DATE</div>
              <div style="font-size: 16px; color: #312E81; font-weight: 700;">{{date}}</div>
            </div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #4B5563; padding-top: 15px; border-top: 1px solid #C7D2FE;">
          <div>
            <div style="color: #4F46E5; font-weight: 700;">{{company_name}}</div>
            <div style="margin-top: 4px; font-weight: 600;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 600;">{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px; font-weight: 600;">Page {{page_number}} of {{total_pages}}</div>
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
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 18px;
          background-color: #EEF2FF;
          padding: 12px 16px;
          border-radius: 8px;
          letter-spacing: -0.01em;
        }
        .quotation-table {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
        }
        .quotation-table th {
          background-color: #4F46E5;
          color: white;
          font-weight: 700;
          padding: 16px;
          text-align: left;
          font-size: 12px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .quotation-table td {
          padding: 16px;
          border-bottom: 1px solid #E0E7FF;
          color: #1F2937;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #EEF2FF;
        }
        .quotation-total-row {
          font-weight: 800;
          background-color: #E0E7FF !important;
          color: #4338CA !important;
        }
        .client-info {
          background-color: #EEF2FF;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }
        
        /* Enhanced client info styling for bold labels */
        .client-info div > strong, 
        .client-info .label,
        .client-info .heading,
        .client-info label,
        .client-info .info-label,
        .client-info b {
          color: #4338CA;
          font-weight: 800 !important; 
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          letter-spacing: -0.01em;
        }
        .client-info .value,
        .client-info .info-value {
          color: #1F2937;
          margin-bottom: 16px;
          font-weight: 500;
          font-size: 14px;
        }
        
        /* Terms section styling */
        .terms-heading {
          font-weight: 700;
          color: #4338CA;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        /* Summary section styling */
        .summary-row-label {
          font-weight: 700;
       color: #4338CA;
        }
        .summary-total {
          font-weight: 800;
          color: #4338CA;
          font-size: 16px;
        }
        
        /* Fix for white text in header */
        .indigo-header h1, 
        .indigo-header div {
          color: white !important;
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
  // 10. Minimal Black (Enhanced)
  {
    name: "Minimal Black",
    description: "A premium minimalist template with sophisticated black accents",
    isDefault: false,
    previewImage: "/images/templates/minimal-black.jpg",
    layout: {
      header: {
        show: true,
        height: 130,
        content: `<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 22px; border-bottom: 1px solid #E5E7EB;">
          <div style="display: flex; align-items: center; gap: 25px;">
            <div style="padding: 8px; background: #F9FAFB; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">{{company_logo}}</div>
            <div>
              <h1 style="font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 5px 0; letter-spacing: -0.02em;">{{company_name}}</h1>
              <div style="font-size: 14px; color: #4B5563; font-weight: 500;">{{company_tagline}}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; color: #111827; margin-bottom: 6px; font-weight: 700;">Quotation</div>
            <div style="font-size: 16px; color: #111827; font-weight: 600;">{{quotation_number}}</div>
            <div style="font-size: 12px; color: #4B5563; margin-top: 5px; font-weight: 500;">{{date}}</div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #4B5563; padding-top: 15px; border-top: 1px solid #E5E7EB;">
          <div>
            <div style="color: #111827; font-weight: 600;">{{company_name}}</div>
            <div style="margin-top: 4px; font-weight: 500;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 500;">{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px; font-weight: 500;">Page {{page_number}} of {{total_pages}}</div>
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
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 18px;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-size: 12px;
        }
        .quotation-table {
          width: 100%;
          border-collapse: collapse;
          box-shadow: 0 4px 6px rgba(0,0,0,0.03);
          border-radius: 8px;
          overflow: hidden;
        }
        .quotation-table th {
          background-color: #111827;
          color: white;
          font-weight: 600;
          padding: 16px;
          text-align: left;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .quotation-table td {
          padding: 16px;
          border-bottom: 1px solid #F3F4F6;
          color: #111827;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F9FAFB;
        }
        .quotation-total-row {
          font-weight: 700;
          background-color: #F3F4F6 !important;
          color: #111827 !important;
        }
        .client-info {
          background-color: #F9FAFB;
          padding: 22px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03);
          margin-bottom: 24px;
        }
        .client-info strong, .client-info .info-label {
          color: #111827;
          font-weight: 700;
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
        }
        .client-info .info-value {
          color: #374151;
          margin-bottom: 12px;
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
  // 12. Teal Waves (Enhanced)
  {
    name: "Teal Waves",
    description: "A soothing template with teal accents and wave patterns",
    isDefault: false,
    previewImage: "/images/templates/teal-waves.jpg",
    layout: {
      header: {
        show: true,
        height: 160,
        content: `<div class="teal-header" style="position: relative; padding: 28px; background-color: #CCFBF1; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.4; background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDI1QzIwIDI1IDIwIDc1IDQwIDc1QzYwIDc1IDYwIDI1IDgwIDI1QzEwMCAyNSAxMDAgNzUgMTIwIDc1QzE0MCA3NSAxNDAgMjUgMTYwIDI1QzE4MCAyNSAxODAgNzUgMjAwIDc1IiBmaWxsPSJub25lIiBzdHJva2U9IiMwRDk0ODgiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+PC9zdmc+');"></div>
       <div style="position: relative; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 22px;">
              <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">{{company_logo}}</div>
              <div>
                <h1 style="font-size: 28px; font-weight: 700; color: #0F766E; margin: 0 0 8px 0; letter-spacing: -0.02em;">{{company_name}}</h1>
                <div style="font-size: 14px; color: #115E59; font-weight: 500;">{{company_tagline}}</div>
              </div>
            </div>
            <div style="background-color: white; padding: 16px; border-radius: 10px; text-align: right; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <div style="font-size: 12px; color: #0F766E; margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">QUOTATION</div>
              <div style="font-size: 16px; color: #134E4A; font-weight: 700;">{{quotation_number}}</div>
              <div style="font-size: 12px; color: #0F766E; margin-top: 5px; font-weight: 500;">{{date}}</div>
            </div>
          </div>
        </div>`,
      },
      footer: {
        show: true,
        height: 80,
        content: `<div style="display: flex; justify-content: space-between; font-size: 11px; color: #4B5563; padding-top: 15px; border-top: 1px solid #99F6E4;">
          <div>
            <div style="color: #0F766E; font-weight: 600;">{{company_name}}</div>
            <div style="margin-top: 4px; font-weight: 500;">{{company_address}}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 500;">{{company_email}} • {{company_phone}}</div>
            <div style="margin-top: 4px; font-weight: 500;">Page {{page_number}} of {{total_pages}}</div>
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
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 2px solid #99F6E4;
          letter-spacing: -0.01em;
        }
        .quotation-table {
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.07);
        }
        .quotation-table th {
          background-color: #0F766E;
          color: white;
          font-weight: 600;
          padding: 16px;
          text-align: left;
          font-size: 12px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .quotation-table td {
          padding: 16px;
          border-bottom: 1px solid #CCFBF1;
          color: #1F2937;
        }
        .quotation-table tr:last-child td {
          border-bottom: none;
        }
        .quotation-table tr:nth-child(even) {
          background-color: #F0FDFA;
        }
        .quotation-total-row {
          font-weight: 700;
          background-color: #CCFBF1 !important;
          color: #134E4A !important;
        }
        .client-info {
          background-color: #F0FDFA;
          border-radius: 10px;
          padding: 20px;
          border: 1px solid #99F6E4;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          margin-bottom: 24px;
        }
        .client-info strong, .client-info .info-label {
          color: #115E59;
          font-weight: 700;
          display: block;
          margin-bottom: 4px;
          font-size: 14px;
        }
        .client-info .info-value {
          color: #1F2937;
          margin-bottom: 12px;
        }
        .teal-header h1, .teal-header div {
          color: #0F766E !important;
          text-shadow: 0 1px 2px rgba(255,255,255,0.5);
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