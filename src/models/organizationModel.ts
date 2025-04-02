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
  
  // Integration related fields
  webhookSecret: string;
  apiConfigurations: {
    webhooksEnabled: boolean;
    apiKeysEnabled: boolean;
    allowedOrigins: string[]; // CORS origins
    webhookCallbackBaseUrl?: string; // Base URL for callback URL
    maxWebhooksAllowed: number;
    maxApiKeysAllowed: number;
  };
  
  notifications?: {
    newLeadEmail: boolean;
    newLeadWhatsapp: boolean;
    webhookFailure?: boolean; // Notify on webhook failures
    dailyReportTime?: string; // Store time in 24-hour format (HH:MM)
  };
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
    webhookSecret: {
      type: String,
      default: () => require('crypto').randomBytes(32).toString('hex'), // Generate a default secret
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
    
    // Enhanced API configuration
    apiConfigurations: {
      webhooksEnabled: {
        type: Boolean,
        default: true
      },
      apiKeysEnabled: {
        type: Boolean,
        default: true
      },
      allowedOrigins: {
        type: [String],
        default: ["*"] // Allow all origins by default
      },
      webhookCallbackBaseUrl: {
        type: String
      },
      maxWebhooksAllowed: {
        type: Number,
        default: 10 // Default limit can be adjusted based on plan
      },
      maxApiKeysAllowed: {
        type: Number,
        default: 5 // Default limit can be adjusted based on plan
      }
    },
    
    notifications: {
      newLeadEmail: {
        type: Boolean,
        default: true,
      },
      newLeadWhatsapp: {
        type: Boolean,
        default: true,
      },
      webhookFailure: {
        type: Boolean,
        default: true,
      },
      dailyReportTime: {
        type: String,
        default: "09:00" // Default to 9:00 AM
      }
    },
  },
{ timestamps: true }
);

// Pre-save hook to ensure webhook secret exists
organizationSchema.pre('save', function(next) {
  // If webhook secret doesn't exist, generate one
  if (!this.webhookSecret) {
    this.webhookSecret = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', organizationSchema);