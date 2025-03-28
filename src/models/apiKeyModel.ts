import mongoose, { Schema, model, Document, models } from 'mongoose';

export interface IApiKey extends Document {
  name: string;
  key: string;
  permissions: string[];
  organization: mongoose.Types.ObjectId;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const apiKeySchema = new Schema<IApiKey>(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    permissions: [{
      type: String,
      enum: ['read', 'write', 'admin'],
      required: true
    }],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    lastUsed: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default models.ApiKey || model<IApiKey>('ApiKey', apiKeySchema);