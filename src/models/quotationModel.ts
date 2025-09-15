import mongoose, { Document, Model, Schema } from 'mongoose';

// Item interface for line items in the quotation
interface IQuotationItem {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
    total: number;
}

// Interface for terms and conditions
interface ITerms {
    title: string;
    content: string;
}

// Interface for notes
interface INote {
    content: string;
    createdBy: mongoose.Types.ObjectId | string;
    timestamp: Date;
}

// Interface for approval history
interface IApprovalHistory {
    status: 'pending' | 'approved' | 'revision_requested';
    comment?: string;
    updatedBy?: mongoose.Types.ObjectId;
    timestamp: Date;
}

export interface IQuotation extends Document {
    quotationNumber: string;
    title: string;
    organization: mongoose.Types.ObjectId;
    creator: mongoose.Types.ObjectId;
    lead: mongoose.Types.ObjectId;
    contact: mongoose.Types.ObjectId;
    items: IQuotationItem[];
    subtotal: number;
    discount?: {
        type: 'percentage' | 'fixed';
        value: number;
        amount: number;
    };
    tax?: {
        name: string;
        percentage: number;
        amount: number;
    };
    shipping?: number;
    total: number;
    currency: string;
    issueDate: Date;
    validUntil: Date;
    status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
    terms: ITerms[];
    notes: INote[];
    approvalHistory: IApprovalHistory[];
    template: string;
    publicAccessToken: string;
    logos: {
        company?: string;
        additional?: string[];
    };
    customFields?: Record<string, any>;
    attachments?: string[];
    lastViewed?: Date;
    sendHistory?: {
        sentBy: mongoose.Types.ObjectId;
        sentTo: string;
        sentAt: Date;
        method: 'email' | 'link' | 'download';
    }[];

    // New fields from organization settings
    companyDetails: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website?: string;
        taxId?: string;
        registrationNumber?: string;
    };
    clientSalutation: string;
    digitalSignature?: string;
    organizationLogo?: string;
    additionalLogos?: string[];
}

const QuotationItemSchema = new Schema<IQuotationItem>({
    name: { type: String },
    description: { type: String },
    quantity: { type: Number },
    unitPrice: { type: Number },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number }
});

const TermsSchema = new Schema<ITerms>({
    title: { type: String },
    content: { type: String }
});

const NoteSchema = new Schema<INote>({
    content: { type: String },
    createdBy: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});

const ApprovalHistorySchema = new Schema<IApprovalHistory>({
    status: {
        type: String,
        required: true,
        enum: ['pending', 'approved', 'revision_requested']
    },
    comment: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
});

const quotationSchema = new Schema<IQuotation>(
    {
        quotationNumber: {
            type: String,
        },
        title: {
            type: String,
            required: true
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
        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lead',
        },
        contact: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact',
        },
        items: [QuotationItemSchema],
        subtotal: {
            type: Number,
        },
        discount: {
            type: {
                type: String,
                enum: ['percentage', 'fixed'],
            },
            value: Number,
            amount: Number
        },
        tax: {
            name: String,
            percentage: Number,
            amount: Number
        },
        shipping: Number,
        total: {
            type: Number,
        },
        currency: {
            type: String,
            default: 'USD'
        },
        issueDate: {
            type: Date,
            default: Date.now
        },
        validUntil: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['draft', 'sent', 'approved', 'rejected', 'expired'],
            default: 'draft'
        },
        terms: [TermsSchema],
        notes: [NoteSchema],
        approvalHistory: [ApprovalHistorySchema],
        template: {
            type: String,
            default: 'default'
        },
        publicAccessToken: {
            type: String,
            default: () => require('crypto').randomBytes(32).toString('hex')
        },
        logos: {
            company: String,
            additional: [String]
        },
        // Add new fields
        companyDetails: {
            name: { type: String, default: '' },
            address: { type: String, default: '' },
            phone: { type: String, default: '' },
            email: { type: String, default: '' },
            website: { type: String, default: '' },
            taxId: { type: String, default: '' },
            registrationNumber: { type: String, default: '' },
        },
        clientSalutation: {
            type: String,
            default: 'Dear'
        },
        digitalSignature: {
            type: String,
            default: null
        },
        organizationLogo: {
            type: String,
            default: null
        },
        additionalLogos: [{
            type: String
        }],

        customFields: {
            type: Map,
            of: Schema.Types.Mixed
        },
        attachments: [String],
        lastViewed: Date,
        sendHistory: [{
            sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            sentTo: String,
            sentAt: { type: Date, default: Date.now },
            method: {
                type: String,
                enum: ['email', 'link', 'download'],
                required: true
            }
        }]
    },
    { timestamps: true }
);


// Auto-update public access token when status changes to sent
quotationSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'sent') {
        this.publicAccessToken = require('crypto').randomBytes(32).toString('hex');
    }
    next();
});

export const QuotationModel: Model<IQuotation> =
    mongoose.models.Quotation || mongoose.model<IQuotation>('Quotation', quotationSchema);

export default QuotationModel;