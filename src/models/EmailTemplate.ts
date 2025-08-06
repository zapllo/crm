import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
    userId: mongoose.Schema.Types.ObjectId;   // The CRM user ID who owns it
    name: string;     // Template name
    subject: string;  // Template subject (may contain placeholders)
    body: string;     // Template body (HTML), with placeholders
    type: 'email' | 'whatsapp';  // Template type
    isHtml: boolean;  // Whether the body contains HTML formatting
    createdAt: Date;
    updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { 
        type: String, 
        required: true 
    },
    subject: { 
        type: String, 
        required: function(this: IEmailTemplate) {
            return this.type === 'email';
        }
    },
    body: { 
        type: String, 
        required: true 
    }, // HTML content for emails, plain text for WhatsApp
    type: {
        type: String,
        enum: ['email', 'whatsapp'],
        default: 'email'
    },
    isHtml: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.models.EmailTemplate ||
    mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);