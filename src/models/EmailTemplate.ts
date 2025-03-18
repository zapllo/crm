import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
    userId: mongoose.Schema.Types.ObjectId;   // The CRM user ID who owns it
    name: string;     // Template name
    subject: string;  // Template subject (may contain placeholders)
    body: string;     // Template body (HTML), with placeholders
    createdAt: Date;
    updatedAt: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true }, // HTML content
}, { timestamps: true });

export default mongoose.models.EmailTemplate ||
    mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
