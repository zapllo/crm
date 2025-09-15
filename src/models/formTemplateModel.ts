import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { IFormField, IFormTheme } from './formBuilderModel';

export interface IFormTemplate extends Document {
  name: string;
  description: string;
  category: string;
  previewImage?: string;
  fields: IFormField[];
  theme: IFormTheme;
  isPublic: boolean;
  creator?: Types.ObjectId;
  organization?: Types.ObjectId;
  usageCount: number;
  tags: string[];
}

const formTemplateSchema = new Schema<IFormTemplate>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    previewImage: { type: String },
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
        label: { type: String },
        value: { type: String }
      }],
      validationRules: [{
        type: {
          type: String,
          enum: ['required', 'email', 'minLength', 'maxLength', 'regex', 'custom']
        },
        value: { type: Schema.Types.Mixed },
        message: { type: String }
      }],
      properties: { type: Map, of: Schema.Types.Mixed },
      conditional: {
        field: { type: String },
        operator: { type: String },
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
    isPublic: { type: Boolean, default: false },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
    },
    usageCount: { type: Number, default: 0 },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

formTemplateSchema.index({ name: 'text', description: 'text', tags: 'text' });
formTemplateSchema.index({ category: 1, isPublic: 1 });
formTemplateSchema.index({ organization: 1 });

export const FormTemplate: Model<IFormTemplate> =
  mongoose.models.FormTemplate || mongoose.model<IFormTemplate>('FormTemplate', formTemplateSchema);

export default FormTemplate;
