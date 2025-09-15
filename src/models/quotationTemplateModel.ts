import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IQuotationTemplate extends Document {
  name: string;
  description: string;
  organization: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  isDefault: boolean;
  previewImage: string;
  layout: {
    header: {
      show: boolean;
      height: number;
      content: string;
    };
    footer: {
      show: boolean;
      height: number;
      content: string;
    };
    sections: {
      id: string;
      type: string;
      title: string;
      content: string;
      order: number;
      isVisible: boolean;
      styles: Record<string, any>;
    }[];
  };
  styles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
    borderStyle: string;
    tableBorders: boolean;
    alternateRowColors: boolean;
    customCSS: string;
  };
  pageSettings: {
    pageSize: string;
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
}

const TemplateSchema = new Schema<IQuotationTemplate>(
  {
    name: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    previewImage: {
      type: String,
    },
    layout: {
      header: {
        show: { type: Boolean, default: true },
        height: { type: Number, default: 100 },
        content: { type: String, default: '' },
      },
      footer: {
        show: { type: Boolean, default: true },
        height: { type: Number, default: 80 },
        content: { type: String, default: '' },
      },
      sections: [{
        id: { type: String, required: true },
        type: { type: String, required: true },
        title: { type: String },
        content: { type: String },
        order: { type: Number, required: true },
        isVisible: { type: Boolean, default: true },
        styles: { type: Map, of: Schema.Types.Mixed },
      }],
    },
    styles: {
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#1E40AF' },
      fontFamily: { type: String, default: 'Inter, sans-serif' },
      fontSize: { type: String, default: '12px' },
      borderStyle: { type: String, default: 'solid' },
      tableBorders: { type: Boolean, default: true },
      alternateRowColors: { type: Boolean, default: true },
      customCSS: { type: String, default: '' },
    },
    pageSettings: {
      pageSize: { type: String, default: 'A4' },
      orientation: { 
        type: String, 
        enum: ['portrait', 'landscape'],
        default: 'portrait'
      },
      margins: {
        top: { type: Number, default: 40 },
        right: { type: Number, default: 40 },
        bottom: { type: Number, default: 40 },
        left: { type: Number, default: 40 },
      },
    },
  },
  { timestamps: true }
);

// Ensure only one default template per organization
TemplateSchema.pre('save', async function(next) {
  if (this.isDefault) {
    try {
      await mongoose.model('QuotationTemplate').updateMany(
        { 
          organization: this.organization, 
          _id: { $ne: this._id }, 
          isDefault: true 
        },
        { isDefault: false }
      );
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export const QuotationTemplateModel: Model<IQuotationTemplate> =
  mongoose.models.QuotationTemplate || 
  mongoose.model<IQuotationTemplate>('QuotationTemplate', TemplateSchema);

export default QuotationTemplateModel;