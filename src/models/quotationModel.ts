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

// Main Quotation interface
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
}

const QuotationItemSchema = new Schema<IQuotationItem>({
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true }
});

const TermsSchema = new Schema<ITerms>({
    title: { type: String, required: true },
    content: { type: String, required: true }
});

const NoteSchema = new Schema<INote>({
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.Mixed, required: true },
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
            required: true,
        },
        contact: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact',
            required: true,
        },
        items: [QuotationItemSchema],
        subtotal: {
            type: Number,
            required: true
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
            required: true
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
            required: true
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

// Pre-save hook to generate quotation number if not provided
quotationSchema.pre('save', async function (next) {
    if (this.isNew && !this.quotationNumber) {
        try {
            const prefix = 'QUO-';
            const date = new Date();
            const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;

            // Find the latest quotation for this organization
            const latestQuotation = await mongoose.model('Quotation').findOne(
                { organization: this.organization },
                {},
                { sort: { createdAt: -1 } }
            );

            let sequence = 1;
            if (latestQuotation && latestQuotation.quotationNumber) {
                const lastNumber = latestQuotation.quotationNumber.split('-').pop();
                if (lastNumber && !isNaN(Number(lastNumber))) {
                    sequence = Number(lastNumber) + 1;
                }
            }

            this.quotationNumber = `${prefix}${yearMonth}-${String(sequence).padStart(4, '0')}`;
            next();
        } catch (error) {
            next(error as Error);
        }
    } else {
        next();
    }
});

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