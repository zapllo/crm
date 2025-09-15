import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrganization extends Document {
  _id: string;
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
  activeSubscriptions?: string[];
  // Logo and branding
  logo?: string;
  additionalLogos?: string[];
  // Organization-specific settings
  settings?: {
    quotations?: {
      enabled?: boolean;
      defaultCurrency: string;
      defaultExpiry: number;
      quotationPrefix: string;
      clientSalutation: string;
      companyDetails: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website?: string;
        taxId?: string;
        registrationNumber?: string;
      };
      termsAndConditions?: string;
      emailSignature?: string;
      digitalSignature?: string;
    }
  };
  // Integration related fields
  webhookSecret: string;
  aiCredits: number;
  apiConfigurations: {
    webhooksEnabled: boolean;
    apiKeysEnabled: boolean;
    allowedOrigins: string[];
    webhookCallbackBaseUrl?: string;
    maxWebhooksAllowed: number;
    maxApiKeysAllowed: number;
  };
  // WhatsApp Business API integration - simplified
  whatsappIntegration?: {
    wabaId?: string;
    isConnected: boolean;
    connectedAt?: Date;
    lastSyncAt?: Date;
    templates?: {
      whatsappTemplateId: string;
      name: string;
      category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY' | 'CAROUSEL' | 'CAROUSEL_UTILITY' | 'LIMITED_TIME_OFFER';
      language: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED' | 'DELETED';
      components?: any[]; // Simplified to handle complex nested structure
      rejectionReason?: string;
      approvedAt?: Date;
      lastUsed?: Date;
      useCount?: number;
      syncedAt: Date;
    }[];
  };
  notifications?: {
    newLeadEmail: boolean;
    newLeadWhatsapp: boolean;
    webhookFailure?: boolean;
    dailyReportTime?: string;
  };

  formBuilder?: {
    enabled: boolean;
    plan: 'starter' | 'growth' | 'pro' | 'enterprise' | null;
    maxForms: number;
    maxSubmissionsPerMonth: number;
    submissionsCount: {
      currentMonth: number;
      lastResetDate: Date;
    };
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
    aiCredits: {
      type: Number,
      default: 100 // Start with 100 free AI credits
    },
    subscribedPlan: {
      type: String,
    },
    activeSubscriptions: {
      type: [String],
      default: []
    },
    logo: {
      type: String,
    },
    additionalLogos: {
      type: [String],
      default: []
    },
    settings: {
      quotations: {
        enabled: {
          type: Boolean,
          default: false
        },
        defaultCurrency: {
          type: String,
          default: 'USD'
        },
        defaultExpiry: {
          type: Number,
          default: 30
        },
        quotationPrefix: {
          type: String,
          default: 'QUO'
        },
        clientSalutation: {
          type: String,
          default: 'Dear'
        },
        companyDetails: {
          name: {
            type: String,
            default: ''
          },
          address: {
            type: String,
            default: ''
          },
          phone: {
            type: String,
            default: ''
          },
          email: {
            type: String,
            default: ''
          },
          website: {
            type: String,
            default: ''
          },
          taxId: {
            type: String,
            default: ''
          },
          registrationNumber: {
            type: String,
            default: ''
          }
        },
        termsAndConditions: {
          type: String,
          default: ''
        },
        emailSignature: {
          type: String,
          default: ''
        },
        // Add the new digital signature field
        digitalSignature: {
          type: String,
          default: null
        }
      }
    },
    webhookSecret: {
      type: String,
      default: () => require('crypto').randomBytes(32).toString('hex'),
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
        default: ["*"]
      },
      webhookCallbackBaseUrl: {
        type: String
      },
      maxWebhooksAllowed: {
        type: Number,
        default: 10
      },
      maxApiKeysAllowed: {
        type: Number,
        default: 5
      }
    },

    // Simplified WhatsApp integration schema - removed qualityScore
    whatsappIntegration: {
      wabaId: {
        type: String
      },
      isConnected: {
        type: Boolean,
        default: false
      },
      connectedAt: {
        type: Date
      },
      lastSyncAt: {
        type: Date
      },
      templates: [{
        whatsappTemplateId: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        category: {
          type: String,
          enum: ['AUTHENTICATION', 'MARKETING', 'UTILITY', 'CAROUSEL', 'CAROUSEL_UTILITY', 'LIMITED_TIME_OFFER'],
          default: 'UTILITY'
        },
        language: {
          type: String,
          default: 'en'
        },
        status: {
          type: String,
          enum: ['PENDING', 'APPROVED', 'REJECTED', 'DISABLED', 'DELETED'],
          default: 'PENDING'
        },
        components: {
          type: Schema.Types.Mixed, // Use Mixed to handle complex nested structures
          default: []
        },
        rejectionReason: String,
        // Removed qualityScore - it was causing issues
        approvedAt: Date,
        lastUsed: Date,
        useCount: {
          type: Number,
          default: 0
        },
        syncedAt: {
          type: Date,
          default: Date.now
        }
      }]
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
        default: "09:00"
      }
    },

    formBuilder: {
      enabled: {
        type: Boolean,
        default: false
      },
      plan: {
        type: String,
        enum: ['starter', 'growth', 'pro', 'enterprise', null],
        default: null
      },
      maxForms: {
        type: Number,
        default: 0
      },
      maxSubmissionsPerMonth: {
        type: Number,
        default: 0
      },
      submissionsCount: {
        currentMonth: {
          type: Number,
          default: 0
        },
        lastResetDate: {
          type: Date,
          default: Date.now
        }
      }
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure webhook secret exists
organizationSchema.pre('save', function (next) {
  if (!this.webhookSecret) {
    this.webhookSecret = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

export const Organization: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', organizationSchema);

export default Organization;