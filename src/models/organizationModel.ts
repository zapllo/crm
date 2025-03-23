import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrganization extends Document {
  companyName: string;
  industry: string;
  teamSize: string;
  description: string;
  country: string;
  categories: mongoose.Types.ObjectId[];
  users: mongoose.Types.ObjectId[];
  isPro: boolean;
  userExceed: boolean;
  credits: number;
  subscribedPlan?: string;
  subscribedUserCount?: number;
  subscriptionExpires?: Date;
  trialExpires: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    companyName: {
      type: String,
      required: true,
      unique: false,
    },
    industry: {
      type: String,
      required: true,
      enum: [
        "Retail/E-Commerce",
        "Technology",
        "Service Provider",
        "Healthcare(Doctors/Clinics/Physicians/Hospital)",
        "Logistics",
        "Financial Consultants",
        "Trading",
        "Education",
        "Manufacturing",
        "Real Estate/Construction/Interior/Architects",
        "Other",
      ],
    },
    teamSize: {
      type: String,
      required: true,
      enum: ["1-10", "11-20", "21-30", "31-50", "51+"],
    },
    description: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
      },
    ],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    isPro: {
      type: Boolean,
      default: false,
    },
    userExceed: {
      type: Boolean,
      default: false,
    },
    credits: { 
      type: Number, 
      default: 0 
    },
    subscribedPlan: {
      type: String,
    },
    subscribedUserCount: {
      type: Number,
    },
    subscriptionExpires: {
      type: Date,
    },
    trialExpires: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', organizationSchema);