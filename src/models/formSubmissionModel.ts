import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IFormSubmission extends Document {
  form: Types.ObjectId;
  organization: Types.ObjectId;
  submittedBy?: Types.ObjectId; // User ID if logged in
  submitterDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    ip?: string;
    userAgent?: string;
  };
  data: Record<string, any>; // Form field values
  files?: {
    fieldId: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
  }[];
  status: 'new' | 'viewed' | 'contacted' | 'converted' | 'archived';
  notes?: {
    text: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
  }[];
  leadId?: Types.ObjectId; // Reference to CRM lead if converted
  contactId?: Types.ObjectId; // Reference to CRM contact
  tags?: string[];
  startedAt?: Date;
  completedAt: Date;
}

const formSubmissionSchema = new Schema<IFormSubmission>(
  {
    form: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    submitterDetails: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      ip: { type: String },
      userAgent: { type: String },
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true,
    },
    files: [{
      fieldId: { type: String, required: true },
      filename: { type: String, required: true },
      url: { type: String, required: true },
      mimetype: { type: String, required: true },
      size: { type: Number, required: true },
    }],
    status: {
      type: String,
      enum: ['new', 'viewed', 'contacted', 'converted', 'archived'],
      default: 'new',
    },
    notes: [{
      text: { type: String, required: true },
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      createdAt: { type: Date, default: Date.now }
    }],
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
    },
    contactId: {
      type: Schema.Types.ObjectId,
      ref: 'Contact',
    },
    tags: [{ type: String }],
    startedAt: { type: Date },
    completedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

// Add a method to convert submission to CRM lead
formSubmissionSchema.methods.convertToLead = async function(this: IFormSubmission, pipelineId: string, stageId: string, assignedTo?: string) {
  // This would be implemented to create a Lead record in your CRM
  // Return the created Lead ID
};

// Add index for faster querying by form and status
formSubmissionSchema.index({ form: 1, status: 1 });
formSubmissionSchema.index({ organization: 1, createdAt: -1 });

export const FormSubmission: Model<IFormSubmission> =
  mongoose.models.FormSubmission || mongoose.model<IFormSubmission>('FormSubmission', formSubmissionSchema);

export default FormSubmission;
