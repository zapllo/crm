import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrganization extends Document {
  companyName: string;
  industry?: string;
  teamSize?: string;
  description?: string;
  country?: string;
  categories?: string[];
}

const organizationSchema = new Schema<IOrganization>(
  {
    companyName: { type: String, required: true },
    industry: { type: String },
    teamSize: { type: String },
    description: { type: String },
    country: { type: String },
    categories: [{ type: String }],
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', organizationSchema);
