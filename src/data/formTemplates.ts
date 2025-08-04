import { IFormField } from "@/models/formBuilderModel";

// Helper function to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Template structure
interface FormTemplate {
  name: string;
  description: string;
  category: string;
  tags: string[];
  coverImage?: string;
  fields: IFormField[];
  theme: any;
}

// Create templates optimized for Indian MSMEs
export const msmeTemplates: FormTemplate[] = [
  // 1. Customer Feedback Form
  {
    name: "Customer Feedback Form",
    description: "Collect valuable feedback from your customers to improve your products and services",
    category: "customer-service",
    tags: ["feedback", "customer", "survey", "retail"],
    coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
    fields: [
      {
        id: generateId(),
        type: "heading",
        label: "We value your feedback",
        required: false,
        properties: { headingLevel: "h2", align: "center" },
        order: 0
      },
      {
        id: generateId(),
        type: "paragraph",
        label: "Please take a moment to share your experience with our products/services. Your feedback helps us improve and serve you better.",
        required: false,
        properties: { align: "center" },
        order: 1
      },
      {
        id: generateId(),
        type: "text",
        label: "Name",
        placeholder: "Enter your name",
        required: true,
        order: 2
      },
      {
        id: generateId(),
        type: "email",
        label: "Email",
        placeholder: "Enter your email",
        required: true,
        order: 3
      },
      {
        id: generateId(),
        type: "phone",
        label: "Phone Number",
        placeholder: "Enter your phone number",
        required: false,
        order: 4
      },
      {
        id: generateId(),
        type: "select",
        label: "How did you hear about us?",
        placeholder: "Select an option",
        required: false,
        options: [
          { label: "Social Media", value: "social" },
          { label: "Friend/Family", value: "referral" },
          { label: "Google Search", value: "search" },
          { label: "Advertisement", value: "ad" },
          { label: "Other", value: "other" }
        ],
        order: 5
      },
      {
        id: generateId(),
        type: "rating",
        label: "How would you rate your overall experience?",
        required: true,
        properties: { maxRating: 5, icon: "star" },
        order: 6
      },
      {
        id: generateId(),
        type: "textarea",
        label: "What did you like about our products/services?",
        placeholder: "Please share your positive feedback",
        required: false,
        properties: { rows: 3 },
        order: 7
      },
      {
        id: generateId(),
        type: "textarea",
        label: "What could we improve on?",
        placeholder: "Please share any suggestions for improvement",
        required: false,
        properties: { rows: 3 },
        order: 8
      }
    ],
    theme: {
      primaryColor: "#D32F2F",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
      accentColor: "#FFEBEE",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "0.5rem",
      buttonStyle: "filled"
    }
  },

  // 2. Product Order Form
  {
    name: "Product Order Form",
    description: "Simple order form for Indian businesses to collect product orders and customer details",
    category: "sales",
    tags: ["order", "sales", "products", "e-commerce"],
    coverImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80",
    fields: [
      {
        id: generateId(),
        type: "heading",
        label: "Product Order Form",
        required: false,
        properties: { headingLevel: "h2", align: "center" },
        order: 0
      },
      {
        id: generateId(),
        type: "paragraph",
        label: "Please fill out this form to place your order. We will contact you for payment details.",
        required: false,
        properties: { align: "center" },
        order: 1
      },
      {
        id: generateId(),
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        order: 2
      },
      {
        id: generateId(),
        type: "email",
        label: "Email",
        placeholder: "Enter your email address",
        required: true,
        order: 3
      },
      {
        id: generateId(),
        type: "phone",
        label: "Phone Number",
        placeholder: "Enter your phone number",
        required: true,
        order: 4
      },
      {
        id: generateId(),
        type: "address",
        label: "Delivery Address",
        required: true,
        properties: {
          includeStreet2: true,
          includeCity: true,
          includeState: true,
          includeZip: true,
          includeCountry: true
        },
        order: 5
      },
      {
        id: generateId(),
        type: "select",
        label: "Product Category",
        placeholder: "Select product category",
        required: true,
        options: [
          { label: "Clothing & Apparel", value: "clothing" },
          { label: "Electronics", value: "electronics" },
          { label: "Home & Kitchen", value: "home" },
          { label: "Beauty & Personal Care", value: "beauty" },
          { label: "Food & Groceries", value: "food" }
        ],
        order: 6
      },
      {
        id: generateId(),
        type: "text",
        label: "Product Name",
        placeholder: "Enter product name or item code",
        required: true,
        order: 7
      },
      {
        id: generateId(),
        type: "number",
        label: "Quantity",
        placeholder: "Enter quantity",
        required: true,
        properties: { min: 1, max: 100, step: 1 },
        order: 8
      },
      {
        id: generateId(),
        type: "select",
        label: "Preferred Payment Method",
        placeholder: "Select payment method",
        required: true,
        options: [
          { label: "UPI", value: "upi" },
          { label: "Cash on Delivery", value: "cod" },
          { label: "Bank Transfer", value: "bank" },
          { label: "Credit/Debit Card", value: "card" }
        ],
        order: 9
      },
      {
        id: generateId(),
        type: "textarea",
        label: "Additional Instructions",
        placeholder: "Any special instructions for your order",
        required: false,
        properties: { rows: 3 },
        order: 10
      }
    ],
    theme: {
      primaryColor: "#1976D2",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
      accentColor: "#E3F2FD",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "0.5rem",
      buttonStyle: "filled"
    }
  },

  // 3. Business Loan Application
  {
    name: "MSME Loan Application",
    description: "Application form for small businesses to apply for business loans and financing",
    category: "finance",
    tags: ["loan", "finance", "business", "banking"],
    coverImage: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1756&q=80",
    fields: [
      {
        id: generateId(),
        type: "heading",
        label: "MSME Loan Application Form",
        required: false,
        properties: { headingLevel: "h2", align: "center" },
        order: 0
      },
      {
        id: generateId(),
        type: "paragraph",
        label: "Complete this application to apply for business financing. Our team will review your application and contact you within 2-3 business days.",
        required: false,
        properties: { align: "center" },
        order: 1
      },
      {
        id: generateId(),
        type: "heading",
        label: "Business Information",
        required: false,
        properties: { headingLevel: "h3" },
        order: 2
      },
      {
        id: generateId(),
        type: "text",
        label: "Business Name",
        placeholder: "Enter business name",
        required: true,
        order: 3
      },
      {
        id: generateId(),
        type: "select",
        label: "Business Type",
        placeholder: "Select business type",
        required: true,
        options: [
          { label: "Sole Proprietorship", value: "sole_proprietorship" },
          { label: "Partnership", value: "partnership" },
          { label: "Limited Liability Partnership (LLP)", value: "llp" },
          { label: "Private Limited Company", value: "private_limited" },
          { label: "One Person Company", value: "opc" }
        ],
        order: 4
      },
      {
        id: generateId(),
        type: "text",
        label: "GSTIN",
        placeholder: "Enter GST Identification Number",
        required: true,
        order: 5
      },
      {
        id: generateId(),
        type: "number",
        label: "Years in Business",
        placeholder: "How many years has your business been operating?",
        required: true,
        properties: { min: 0, max: 100, step: 1 },
        order: 6
      },
      {
        id: generateId(),
        type: "heading",
        label: "Contact Information",
        required: false,
        properties: { headingLevel: "h3" },
        order: 7
      },
      {
        id: generateId(),
        type: "text",
        label: "Contact Person Name",
        placeholder: "Enter name of business owner/representative",
        required: true,
        order: 8
      },
      {
        id: generateId(),
        type: "phone",
        label: "Contact Number",
        placeholder: "Enter your mobile number",
        required: true,
        order: 9
      },
      {
        id: generateId(),
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        order: 10
      },
      {
        id: generateId(),
        type: "address",
        label: "Business Address",
        required: true,
        properties: {
          includeStreet2: true,
          includeCity: true,
          includeState: true,
          includeZip: true,
          includeCountry: false
        },
        order: 11
      },
      {
        id: generateId(),
        type: "heading",
        label: "Loan Requirements",
        required: false,
        properties: { headingLevel: "h3" },
        order: 12
      },
      {
        id: generateId(),
        type: "number",
        label: "Loan Amount (₹)",
        placeholder: "Enter amount in rupees",
        required: true,
        properties: { min: 50000, step: 10000 },
        order: 13
      },
      {
        id: generateId(),
        type: "select",
        label: "Loan Purpose",
        placeholder: "Select primary purpose of loan",
        required: true,
        options: [
          { label: "Working Capital", value: "working_capital" },
          { label: "Equipment Purchase", value: "equipment" },
          { label: "Business Expansion", value: "expansion" },
          { label: "Inventory Purchase", value: "inventory" },
          { label: "Debt Consolidation", value: "debt" },
          { label: "Other", value: "other" }
        ],
        order: 14
      },
      {
        id: generateId(),
        type: "select",
        label: "Preferred Loan Tenure",
        placeholder: "Select preferred loan duration",
        required: true,
        options: [
          { label: "6 months", value: "6m" },
          { label: "12 months", value: "12m" },
          { label: "24 months", value: "24m" },
          { label: "36 months", value: "36m" },
          { label: "48 months", value: "48m" },
          { label: "60 months", value: "60m" }
        ],
        order: 15
      },
      {
        id: generateId(),
        type: "file",
        label: "Business PAN Card",
        required: true,
        properties: {
          maxSize: 5,
          maxFiles: 1,
          allowedTypes: ["image/*", "application/pdf"]
        },
        order: 16
      },
      {
        id: generateId(),
        type: "file",
        label: "Bank Statements (Last 6 months)",
        required: true,
        properties: {
          maxSize: 10,
          maxFiles: 2,
          allowedTypes: ["image/*", "application/pdf"]
        },
        order: 17
      },
      {
        id: generateId(),
        type: "checkbox",
        label: "I declare that the information provided is true and accurate",
        required: true,
        options: [
          { label: "I agree", value: "agree" }
        ],
        order: 18
      }
    ],
    theme: {
      primaryColor: "#2E7D32",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
      accentColor: "#E8F5E9",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "0.5rem",
      buttonStyle: "filled"
    }
  },

  // 4. Job Application Form
  {
    name: "Job Application Form",
    description: "Collect job applications with detailed candidate information for your business",
    category: "hr",
    tags: ["recruitment", "hiring", "jobs", "hr"],
    coverImage: "https://images.unsplash.com/photo-1554774853-719586f82d77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    fields: [
      {
        id: generateId(),
        type: "heading",
        label: "Job Application Form",
        required: false,
        properties: { headingLevel: "h2", align: "center" },
        order: 0
      },
      {
        id: generateId(),
        type: "paragraph",
        label: "Thank you for your interest in joining our team. Please complete this application form with accurate information.",
        required: false,
        properties: { align: "center" },
        order: 1
      },
      {
        id: generateId(),
        type: "heading",
        label: "Personal Information",
        required: false,
        properties: { headingLevel: "h3" },
        order: 2
      },
      {
        id: generateId(),
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        order: 3
      },
      {
        id: generateId(),
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        order: 4
      },
      {
        id: generateId(),
        type: "phone",
        label: "Phone Number",
        placeholder: "Enter your mobile number",
        required: true,
        order: 5
      },
      {
        id: generateId(),
        type: "address",
        label: "Current Address",
        required: true,
        properties: {
          includeStreet2: true,
          includeCity: true,
          includeState: true,
          includeZip: true,
          includeCountry: false
        },
        order: 6
      },
      {
        id: generateId(),
        type: "date",
        label: "Date of Birth",
        required: true,
        properties: {
          format: "DD/MM/YYYY"
        },
        order: 7
      },
      {
        id: generateId(),
        type: "heading",
        label: "Position Details",
        required: false,
        properties: { headingLevel: "h3" },
        order: 8
      },
      {
        id: generateId(),
        type: "select",
        label: "Position Applied For",
        placeholder: "Select position",
        required: true,
        options: [
          { label: "Sales Executive", value: "sales_executive" },
          { label: "Customer Service Representative", value: "customer_service" },
          { label: "Administrative Assistant", value: "admin_assistant" },
          { label: "Marketing Specialist", value: "marketing" },
          { label: "Accountant", value: "accountant" },
          { label: "Operations Manager", value: "operations" },
          { label: "Web Developer", value: "developer" },
          { label: "Other", value: "other" }
        ],
        order: 9
      },
      {
        id: generateId(),
        type: "select",
        label: "Expected Salary Range (₹)",
        placeholder: "Select range",
        required: true,
        options: [
          { label: "₹10,000 - ₹20,000 per month", value: "10k-20k" },
          { label: "₹20,000 - ₹30,000 per month", value: "20k-30k" },
          { label: "₹30,000 - ₹50,000 per month", value: "30k-50k" },
          { label: "₹50,000 - ₹75,000 per month", value: "50k-75k" },
          { label: "Above ₹75,000 per month", value: "75k+" }
        ],
        order: 10
      },
      {
        id: generateId(),
        type: "radio",
        label: "Employment Type",
        required: true,
        options: [
          { label: "Full-time", value: "full_time" },
          { label: "Part-time", value: "part_time" },
          { label: "Contract", value: "contract" },
          { label: "Internship", value: "internship" }
        ],
        order: 11
      },
      {
        id: generateId(),
        type: "date",
        label: "Earliest Available Start Date",
        required: true,
        order: 12
      },
      {
        id: generateId(),
        type: "heading",
        label: "Education & Experience",
        required: false,
        properties: { headingLevel: "h3" },
        order: 13
      },
      {
        id: generateId(),
        type: "select",
        label: "Highest Education Qualification",
        placeholder: "Select qualification",
        required: true,
        options: [
          { label: "10th/SSC", value: "ssc" },
          { label: "12th/HSC", value: "hsc" },
          { label: "Diploma", value: "diploma" },
          { label: "Bachelor's Degree", value: "bachelors" },
          { label: "Master's Degree", value: "masters" },
          { label: "PhD", value: "phd" }
        ],
        order: 14
      },
      {
        id: generateId(),
        type: "text",
        label: "Name of Institution/University",
        placeholder: "Enter institution name",
        required: true,
        order: 15
      },
      {
        id: generateId(),
        type: "number",
        label: "Years of Relevant Experience",
        placeholder: "Enter years of experience",
        required: true,
        properties: { min: 0, max: 50, step: 1 },
        order: 16
      },
      {
        id: generateId(),
        type: "textarea",
        label: "Current/Previous Employer",
        placeholder: "Enter company name and your role",
        required: false,
        properties: { rows: 2 },
        order: 17
      },
      {
        id: generateId(),
        type: "file",
        label: "Upload Resume/CV",
        required: true,
        properties: {
          maxSize: 5,
          maxFiles: 1,
          allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        },
        order: 18
      },
      {
        id: generateId(),
        type: "textarea",
        label: "Why do you want to work with us?",
        placeholder: "Briefly explain why you are interested in joining our company",
        required: true,
        properties: { rows: 4 },
        order: 19
      }
    ],
    theme: {
      primaryColor: "#5E35B1",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
      accentColor: "#EDE7F6",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "0.5rem",
      buttonStyle: "filled"
    }
  },

  // 5. Event Registration Form
  {
    name: "Event Registration Form",
    description: "Register participants for workshops, seminars, or business events with this customizable form",
    category: "events",
    tags: ["events", "registration", "workshop", "seminar"],
    coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
    fields: [
      {
        id: generateId(),
        type: "heading",
        label: "Event Registration Form",
        required: false,
        properties: { headingLevel: "h2", align: "center" },
        order: 0
      },
      {
        id: generateId(),
        type: "paragraph",
        label: "Register for our upcoming business event. Limited seats available, so book early!",
        required: false,
        properties: { align: "center" },
        order: 1
      },
      {
        id: generateId(),
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        order: 2
      },
      {
        id: generateId(),
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        order: 3
      },
      {
        id: generateId(),
        type: "phone",
        label: "Phone Number",
        placeholder: "Enter your mobile number",
        required: true,
        order: 4
      },
      {
        id: generateId(),
        type: "text",
        label: "Company/Organization",
        placeholder: "Enter your company name",
        required: true,
        order: 5
      },
      {
        id: generateId(),
        type: "text",
        label: "Designation",
        placeholder: "Enter your job title",
        required: false,
        order: 6
      },
      {
        id: generateId(),
        type: "select",
        label: "Select Event",
        placeholder: "Choose which event you're registering for",
        required: true,
        options: [
          { label: "Digital Marketing Workshop", value: "digital_marketing" },
          { label: "Business Finance Seminar", value: "finance" },
          { label: "Entrepreneurship Masterclass", value: "entrepreneurship" },
          { label: "GST Compliance Workshop", value: "gst" },
          { label: "Networking Business Mixer", value: "networking" }
        ],
        order: 7
      },
      {
        id: generateId(),
        type: "radio",
        label: "Session Time Preference",
        required: true,
        options: [
          { label: "Morning (10:00 AM - 1:00 PM)", value: "morning" },
          { label: "Afternoon (2:00 PM - 5:00 PM)", value: "afternoon" }
        ],
        order: 8
      },
      {
        id: generateId(),
        type: "number",
        label: "Number of Attendees",
        placeholder: "How many people will attend?",
        required: true,
        properties: { min: 1, max: 10, step: 1 },
        order: 9
      },
      {
        id: generateId(),
        type: "select",
        label: "How did you hear about this event?",
        placeholder: "Select an option",
        required: false,
        options: [
          { label: "Email", value: "email" },
          { label: "Social Media", value: "social" },
          { label: "Website", value: "website" },
          { label: "Friend/Colleague", value: "referral" },
          { label: "Other", value: "other" }
        ],
        order: 10
      },
      {
        id: generateId(),
        type: "checkbox",
        label: "I would like information about:",
        required: false,
        options: [
          { label: "Future events", value: "future_events" },
          { label: "Business consulting services", value: "consulting" },
          { label: "Partnership opportunities", value: "partnership" },
          { label: "Newsletter subscription", value: "newsletter" }
        ],
        order: 11
      },
      {
        id: generateId(),
        type: "textarea",
        label: "Special Requirements or Questions",
        placeholder: "Any dietary restrictions, accessibility needs, or questions?",
        required: false,
        properties: { rows: 3 },
        order: 12
      },
      {
        id: generateId(),
        type: "checkbox",
        label: "Terms and Conditions",
        required: true,
        options: [
          { label: "I agree to the terms and conditions of participation", value: "agree" }
        ],
        order: 13
      }
    ],
    theme: {
      primaryColor: "#FF6F00",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
      accentColor: "#FFF3E0",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "0.5rem",
      buttonStyle: "filled"
    }
  },

  // 6. Vendor Registration Form
  {
    name: "Vendor Registration Form",
    description: "Register suppliers and vendors for your business with comprehensive information collection",
    category: "procurement",
    tags: ["vendor", "supplier", "procurement", "registration"],
    coverImage: "https://res.cloudinary.com/dndzbt8al/image/upload/v1745315149/premium_photo-1683288662040-5ca51d0880b2_tdq2sq.avif",
    fields: [
      {
        id: generateId(),
        type: "heading",
        label: "Vendor Registration Form",
        required: false,
        properties: { headingLevel: "h2", align: "center" },
        order: 0
      },
      {
        id: generateId(),
        type: "paragraph",
        label: "Please complete this form to register as a vendor/supplier with our company. All information will be kept confidential.",
        required: false,
        properties: { align: "center" },
        order: 1
      },
      {
        id: generateId(),
        type: "heading",
        label: "Company Information",
        required: false,
        properties: { headingLevel: "h3" },
        order: 2
      },
      {
        id: generateId(),
        type: "text",
        label: "Company Name",
        placeholder: "Enter legal company name",
        required: true,
        order: 3
      },
      {
        id: generateId(),
        type: "select",
        label: "Business Type",
        placeholder: "Select business type",
        required: true,
        options: [
          { label: "Manufacturer", value: "manufacturer" },
          { label: "Wholesaler", value: "wholesaler" },
          { label: "Distributor", value: "distributor" },
          { label: "Service Provider", value: "service" },
          { label: "Retailer", value: "retailer" },
          { label: "Other", value: "other" }
        ],
        order: 4
      },
      {
        id: generateId(),
        type: "text",
        label: "GSTIN",
        placeholder: "Enter GST Identification Number",
        required: true,
        order: 5
      },
      {
        id: generateId(),
        type: "text",
        label: "PAN Number",
        placeholder: "Enter company PAN",
        required: true,
        order: 6
      },
      {
        id: generateId(),
        type: "number",
        label: "Years in Business",
        placeholder: "Number of years operating",
        required: true,
        properties: { min: 0, max: 100, step: 1 },
        order: 7
      },
      {
        id: generateId(),
        type: "address",
        label: "Company Address",
        required: true,
        properties: {
          includeStreet2: true,
          includeCity: true,
          includeState: true,
          includeZip: true,
          includeCountry: false
        },
        order: 8
      },
      {
        id: generateId(),
        type: "heading",
        label: "Contact Information",
        required: false,
        properties: { headingLevel: "h3" },
        order: 9
      },
      {
        id: generateId(),
        type: "text",
        label: "Primary Contact Name",
        placeholder: "Enter name of primary contact person",
        required: true,
        order: 10
      },
      {
        id: generateId(),
        type: "text",
        label: "Designation",
        placeholder: "Enter job title",
        required: true,
        order: 11
      },
      {
        id: generateId(),
        type: "email",
        label: "Email Address",
        placeholder: "Enter business email",
        required: true,
        order: 12
      },
      {
        id: generateId(),
        type: "phone",
        label: "Phone Number",
        placeholder: "Enter contact number",
        required: true,
        order: 13
      },
      {
        id: generateId(),
        type: "phone",
        label: "Alternative Phone Number",
        placeholder: "Enter alternate contact number",
        required: false,
        order: 14
      },
      {
        id: generateId(),
        type: "heading",
        label: "Product/Service Information",
        required: false,
        properties: { headingLevel: "h3" },
        order: 15
      },
      {
        id: generateId(),
        type: "checkbox",
        label: "Products/Services Offered",
        required: true,
        options: [
          { label: "Raw Materials", value: "raw_materials" },
          { label: "Finished Products", value: "finished_products" },
          { label: "Packaging Materials", value: "packaging" },
          { label: "Equipment/Machinery", value: "equipment" },
          { label: "Maintenance Services", value: "maintenance" },
          { label: "IT Services", value: "it" },
          { label: "Consulting Services", value: "consulting" },
          { label: "Logistics/Transportation", value: "logistics" }
        ],
        properties: { allowOther: true },
        order: 16
      },
      {
        id: generateId(),
        type: "textarea",
        label: "Brief Description of Products/Services",
        placeholder: "Provide details of your major products or services",
        required: true,
        properties: { rows: 4 },
        order: 17
      },
      {
        id: generateId(),
        type: "checkbox",
        label: "Quality Certifications (if any)",
        required: false,
        options: [
          { label: "ISO 9001", value: "iso_9001" },
          { label: "ISO 14001", value: "iso_14001" },
          { label: "ISO 22000", value: "iso_22000" },
          { label: "FSSAI", value: "fssai" },
          { label: "GMP", value: "gmp" },
          { label: "HACCP", value: "haccp" }
        ],
        properties: { allowOther: true },
        order: 18
      },
      {
        id: generateId(),
        type: "file",
        label: "Upload Company Profile",
        required: false,
        properties: {
          maxSize: 5,
          maxFiles: 1,
          allowedTypes: ["application/pdf"]
        },
        order: 19
      },
      {
        id: generateId(),
        type: "heading",
        label: "Banking Information",
        required: false,
        properties: { headingLevel: "h3" },
        order: 20
      },
      {
        id: generateId(),
        type: "text",
        label: "Bank Name",
        placeholder: "Enter bank name",
        required: true,
        order: 21
      },
      {
        id: generateId(),
        type: "text",
        label: "Account Holder Name",
        placeholder: "Enter account holder name",
        required: true,
        order: 22
      },
      {
        id: generateId(),
        type: "text",
        label: "Account Number",
        placeholder: "Enter account number",
        required: true,
        order: 23
      },
      {
        id: generateId(),
        type: "text",
        label: "IFSC Code",
        placeholder: "Enter IFSC code",
        required: true,
        order: 24
      },
      {
        id: generateId(),
        type: "text",
        label: "Branch Name",
        placeholder: "Enter branch name",
        required: true,
        order: 25
      },
      {
        id: generateId(),
        type: "checkbox",
        label: "Declaration",
        required: true,
        options: [
          { label: "I hereby declare that the information provided above is true to the best of my knowledge", value: "declare" }
        ],
        order: 26
      }
    ],
    theme: {
      primaryColor: "#0277BD",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
      accentColor: "#E1F5FE",
      fontFamily: "Poppins, sans-serif",
      borderRadius: "0.5rem",
      buttonStyle: "filled"
    }
  },

  // 7. Service Booking Form
  {
    name: "Service Booking Form",
    description: "Allow customers to book appointments for services with date/time selection and detailed requirements",
    category: "services",
    tags: ["appointment", "booking", "services", "scheduling"],
    coverImage: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80",
    fields: [
      {
        id: generateId(),
        type: "heading",
        label: "Service Booking Form",
        required: false,
        properties: { headingLevel: "h2", align: "center" },
        order: 0
      },
      {
        id: generateId(),
        type: "paragraph",
        label: "Book your service appointment using this form. We'll confirm your booking within 24 hours.",
        required: false,
        properties: { align: "center" },
        order: 1
      },
      {
        id: generateId(),
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        order: 2
      },
      {
        id: generateId(),
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        order: 3
      },
      {
        id: generateId(),
        type: "phone",
        label: "Phone Number",
        placeholder: "Enter your mobile number",
        required: true,
        order: 4
      },
      {
        id: generateId(),
        type: "select",
        label: "Service Required",
        placeholder: "Select the service you need",
        required: true,
        options: [
          { label: "Business Consultation", value: "consultation" },
          { label: "Tax Filing Services", value: "tax" },
          { label: "Accounting Services", value: "accounting" },
          { label: "IT Support", value: "it_support" },
          { label: "Marketing Strategy Session", value: "marketing" },
          { label: "Legal Services", value: "legal" },
          { label: "Website Development", value: "web_dev" }
        ],
        order: 5
      },
      {
        id: generateId(),
        type: "date",
        label: "Preferred Date",
        required: true,
        properties: {
          minDate: new Date().toISOString().split('T')[0],
          format: "DD/MM/YYYY"
        },
        order: 6
      },
      {
        id: generateId(),
        type: "select",
        label: "Preferred Time Slot",
        placeholder: "Select a time slot",
        required: true,
        options: [
          { label: "9:00 AM - 11:00 AM", value: "9am-11am" },
          { label: "11:00 AM - 1:00 PM", value: "11am-1pm" },
          { label: "2:00 PM - 4:00 PM", value: "2pm-4pm" },
          { label: "4:00 PM - 6:00 PM", value: "4pm-6pm" }
        ],
        order: 7
      },
      {
        id: generateId(),
        type: "radio",
        label: "Service Location",
        required: true,
        options: [
          { label: "At our office", value: "office" },
          { label: "At your location", value: "client_location" },
          { label: "Virtual/Online", value: "virtual" }
        ],
        order: 8
      },
    // 7. Service Booking Form (continued)
    {
      id: generateId(),
      type: "textarea",
      label: "Specific Requirements or Details",
      placeholder: "Please provide any specific details about your service needs",
      required: false,
      properties: { rows: 4 },
      order: 9
    },
    {
      id: generateId(),
      type: "select",
      label: "How did you hear about us?",
      placeholder: "Select an option",
      required: false,
      options: [
        { label: "Google Search", value: "google" },
        { label: "Social Media", value: "social" },
        { label: "Friend/Family", value: "referral" },
        { label: "Email", value: "email" },
        { label: "Advertisement", value: "ad" },
        { label: "Other", value: "other" }
      ],
      order: 10
    },
    {
      id: generateId(),
      type: "checkbox",
      label: "Terms and Conditions",
      required: true,
      options: [
        { label: "I agree to the cancellation policy and service terms", value: "agree" }
      ],
      order: 11
    }
  ],
  theme: {
    primaryColor: "#00796B",
    backgroundColor: "#FFFFFF",
    textColor: "#333333",
    accentColor: "#E0F2F1",
    fontFamily: "Poppins, sans-serif",
    borderRadius: "0.5rem",
    buttonStyle: "filled"
  }
},

// 8. Customer Support/Contact Form
{
  name: "Customer Support Form",
  description: "Provide excellent customer service with this comprehensive support request form",
  category: "customer-service",
  tags: ["support", "contact", "help", "customer service"],
  coverImage: "https://images.unsplash.com/photo-1560264280-88b68371db39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
  fields: [
    {
      id: generateId(),
      type: "heading",
      label: "Customer Support Request",
      required: false,
      properties: { headingLevel: "h2", align: "center" },
      order: 0
    },
    {
      id: generateId(),
      type: "paragraph",
      label: "We're here to help! Please fill out this form and our support team will get back to you within 24 hours.",
      required: false,
      properties: { align: "center" },
      order: 1
    },
    {
      id: generateId(),
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      order: 2
    },
    {
      id: generateId(),
      type: "email",
      label: "Email Address",
      placeholder: "Enter your email address",
      required: true,
      order: 3
    },
    {
      id: generateId(),
      type: "phone",
      label: "Phone Number",
      placeholder: "Enter your mobile number",
      required: true,
      order: 4
    },
    {
      id: generateId(),
      type: "text",
      label: "Order/Reference Number (if applicable)",
      placeholder: "Enter order or reference number",
      required: false,
      order: 5
    },
    {
      id: generateId(),
      type: "select",
      label: "Support Category",
      placeholder: "Select issue category",
      required: true,
      options: [
        { label: "Product Issue", value: "product" },
        { label: "Billing/Payment", value: "billing" },
        { label: "Delivery/Shipping", value: "delivery" },
        { label: "Account Access", value: "account" },
        { label: "Technical Support", value: "technical" },
        { label: "General Inquiry", value: "inquiry" },
        { label: "Feedback/Suggestions", value: "feedback" }
      ],
      order: 6
    },
    {
      id: generateId(),
      type: "select",
      label: "Priority Level",
      placeholder: "Select priority",
      required: true,
      options: [
        { label: "Low - General inquiry", value: "low" },
        { label: "Medium - Issue affecting usage", value: "medium" },
        { label: "High - Urgent issue requiring immediate attention", value: "high" }
      ],
      order: 7
    },
    {
      id: generateId(),
      type: "textarea",
      label: "Describe Your Issue",
      placeholder: "Please provide detailed information about your issue or inquiry",
      required: true,
      properties: { rows: 5 },
      order: 8
    },
    {
      id: generateId(),
      type: "file",
      label: "Attach Files (screenshots, documents, etc.)",
      required: false,
      properties: {
        maxSize: 10,
        maxFiles: 3,
        allowedTypes: ["image/*", "application/pdf", "text/plain"]
      },
      order: 9
    },
    {
      id: generateId(),
      type: "checkbox",
      label: "Contact Preference",
      required: false,
      options: [
        { label: "Contact me via email", value: "email" },
        { label: "Contact me via phone", value: "phone" },
        { label: "Contact me via WhatsApp", value: "whatsapp" }
      ],
      order: 10
    },
    {
      id: generateId(),
      type: "checkbox",
      label: "Permission",
      required: true,
      options: [
        { label: "I agree to the privacy policy and consent to processing my request", value: "agree" }
      ],
      order: 11
    }
  ],
  theme: {
    primaryColor: "#C2185B",
    backgroundColor: "#FFFFFF",
    textColor: "#333333",
    accentColor: "#FCE4EC",
    fontFamily: "Poppins, sans-serif",
    borderRadius: "0.5rem",
    buttonStyle: "filled"
  }
}
];

export default msmeTemplates;
