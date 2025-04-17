import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// Field validation rule
interface IValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'regex' | 'custom';
  value?: any;
  message: string;
}

// Form field definition
export interface IFormField {
  id: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'select' | 'multiSelect' |
        'checkbox' | 'radio' | 'date' | 'time' | 'file' | 'rating' | 'signature' |
        'address' | 'hidden' | 'heading' | 'paragraph' | 'divider';
  label: string;
  placeholder?: string;
  defaultValue?: any;
  required: boolean;
  options?: { label: string; value: string }[];
  validationRules?: IValidationRule[];
  properties?: Record<string, any>; // Additional properties specific to field type
  conditional?: {
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  };
  order: number;
}

// Form template/theme
export interface IFormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: string;
  logoPosition: 'left' | 'center' | 'right';
  customCSS?: string;
}

// Integration settings
export interface IFormIntegration {
  type: 'crm' | 'email' | 'webhook' | 'zapier' | 'whatsapp';
  enabled: boolean;
  config: Record<string, any>; // Configuration specific to integration type
}

// Notification settings
export interface IFormNotification {
  type: 'email' | 'whatsapp' | 'sms';
  enabled: boolean;
  recipients: string[];
  template?: string;
  subject?: string;
}

// Main Form document
export interface IForm extends Document {
  name: string;
  description?: string;
  organization: Types.ObjectId;
  coverImage?: string; // Add coverImage field
  creator: Types.ObjectId;
  isPublished: boolean;
  publishedUrl?: string;
  fields: IFormField[];
  theme: IFormTheme;
  integrations: IFormIntegration[];
  notifications: IFormNotification[];
  thankYouPage: {
    message: string;
    redirectUrl?: string;
    buttonText?: string;
  };
  settings: {
    captcha: boolean;
    limitSubmissions?: number;
    startDate?: Date;
    endDate?: Date;
    allowAnonymous: boolean;
    requireLogin: boolean;
    multiPage: boolean;
    progressBar: boolean;
    autoSave: boolean;
    confirmationEmail: boolean;
  };
  stats: {
    views: number;
    submissions: number;
    conversionRate: number;
    averageCompletionTime: number;
  };
  tags: string[];
  category?: string;
  isTemplate: boolean;
}

const formSchema = new Schema<IForm>(
  {
    name: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String }, // Add coverImage to schema
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: { type: Boolean, default: false },
    publishedUrl: { type: String },
    fields: [{
      id: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: ['text', 'textarea', 'email', 'phone', 'number', 'select', 'multiSelect',
               'checkbox', 'radio', 'date', 'time', 'file', 'rating', 'signature',
               'address', 'hidden', 'heading', 'paragraph', 'divider']
      },
      label: { type: String, required: true },
      placeholder: { type: String },
      defaultValue: { type: Schema.Types.Mixed },
      required: { type: Boolean, default: false },
      options: [{
        label: { type: String, required: true },
        value: { type: String, required: true }
      }],
      validationRules: [{
        type: {
          type: String,
          enum: ['required', 'email', 'minLength', 'maxLength', 'regex', 'custom']
        },
        value: { type: Schema.Types.Mixed },
        message: { type: String, required: true }
      }],
      properties: { type: Map, of: Schema.Types.Mixed },
      conditional: {
        field: { type: String },
        operator: {
          type: String,
          enum: ['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan']
        },
        value: { type: Schema.Types.Mixed }
      },
      order: { type: Number, required: true }
    }],
    theme: {
      primaryColor: { type: String, default: '#3B82F6' },
      backgroundColor: { type: String, default: '#FFFFFF' },
      textColor: { type: String, default: '#1F2937' },
      accentColor: { type: String, default: '#EFF6FF' },
      fontFamily: { type: String, default: 'Inter, sans-serif' },
      borderRadius: { type: String, default: '0.375rem' },
      buttonStyle: { type: String, default: 'filled' },
      logoPosition: {
        type: String,
        enum: ['left', 'center', 'right'],
        default: 'center'
      },
      customCSS: { type: String }
    },
    integrations: [{
      type: {
        type: String,
        enum: ['crm', 'email', 'webhook', 'zapier', 'whatsapp'],
        required: true
      },
      enabled: { type: Boolean, default: false },
      config: { type: Map, of: Schema.Types.Mixed }
    }],
    notifications: [{
      type: {
        type: String,
        enum: ['email', 'whatsapp', 'sms'],
        required: true
      },
      enabled: { type: Boolean, default: false },
      recipients: [{ type: String }],
      template: { type: String },
      subject: { type: String }
    }],
    thankYouPage: {
      message: { type: String, default: 'Thank you for your submission!' },
      redirectUrl: { type: String },
      buttonText: { type: String }
    },
    settings: {
      captcha: { type: Boolean, default: true },
      limitSubmissions: { type: Number },
      startDate: { type: Date },
      endDate: { type: Date },
      allowAnonymous: { type: Boolean, default: true },
      requireLogin: { type: Boolean, default: false },
      multiPage: { type: Boolean, default: false },
      progressBar: { type: Boolean, default: true },
      autoSave: { type: Boolean, default: false },
      confirmationEmail: { type: Boolean, default: false }
    },
    stats: {
      views: { type: Number, default: 0 },
      submissions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 }
    },
    tags: [{ type: String }],
    category: { type: String },
    isTemplate: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Create an index for better search
formSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const FormModel: Model<IForm> =
  mongoose.models.Form || mongoose.model<IForm>('Form', formSchema);

export default FormModel;
