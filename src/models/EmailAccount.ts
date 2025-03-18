import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailAccount extends Document {
    userId: mongoose.Schema.Types.ObjectId;         // The CRM user ID
    provider: string;       // e.g. 'google'
    accessToken: string;    // OAuth token
    refreshToken?: string;
    emailAddress: string;   // e.g. user@gmail.com
    createdAt: Date;
    updatedAt: Date;
}

const EmailAccountSchema = new Schema<IEmailAccount>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: { type: String, required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String },
    emailAddress: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.EmailAccount ||
    mongoose.model<IEmailAccount>('EmailAccount', EmailAccountSchema);
