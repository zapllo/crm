import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IIntegration extends Document {
  userId: Types.ObjectId;
  organizationId: Types.ObjectId;
  platform: string;
  apiKey?: string;
  pipelineId?: string;
  isPurchased: boolean;
  purchaseDate?: Date;
  expiryDate?: Date;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  setupStatus?: string;
  webhookUrl?: string;
  credentials?: Record<string, any>;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema: Schema<IIntegration> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    platform: { type: String, required: true },
    apiKey: { type: String },
    pipelineId: { type: Schema.Types.ObjectId, ref: 'pipelines' },
    isPurchased: { type: Boolean, default: false },
    purchaseDate: { type: Date },
    expiryDate: { type: Date },
    orderId: { type: String },
    paymentId: { type: String },
    amount: { type: Number },
    setupStatus: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    webhookUrl: { type: String },
    credentials: { type: Object },
    settings: { type: Object },
  },
  { timestamps: true }
);

// Create compound index for unique integration per org and platform
IntegrationSchema.index({ organizationId: 1, platform: 1 }, { unique: true });

const Integration: Model<IIntegration> = mongoose.models.Integration || 
  mongoose.model<IIntegration>('Integration', IntegrationSchema);

export default Integration;