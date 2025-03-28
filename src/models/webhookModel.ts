import mongoose, { Schema, model, Document, models } from 'mongoose';

export interface IWebhook extends Document {
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret: string;
  organization: mongoose.Types.ObjectId;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const webhookSchema = new Schema<IWebhook>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    events: [{ type: String, required: true }],
    status: { 
      type: String, 
      enum: ['active', 'inactive'], 
      default: 'active' 
    },
    secret: { type: String, required: true },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    lastTriggered: { type: Date },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.Webhook || model<IWebhook>('Webhook', webhookSchema);