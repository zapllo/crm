import mongoose, { Schema, model, Document } from 'mongoose';

interface IFollowupReminder {
    notificationType: 'email' | 'whatsapp';
    type: 'minutes' | 'hours' | 'days' | 'specific';
    value?: number;
    date?: Date;
    sent: boolean;
}

interface IFollowupRemark {
    text: string;
    timestamp: Date;
}

interface IFollowup extends Document {
    followupId: string;
    lead: Schema.Types.ObjectId;
    addedBy: Schema.Types.ObjectId;
    description: string;
    type: 'Call' | 'Email' | 'WhatsApp';
    followupDate: Date;
    remarks: string[]; // Array to store multiple remarks
    stage: 'Open' | 'Closed'; // Follow-up stage
    reminders: IFollowupReminder[];
}

const followupReminderSchema = new Schema<IFollowupReminder>({
    notificationType: { type: String, enum: ['email', 'whatsapp'] },
    type: { type: String, enum: ['minutes', 'hours', 'days', 'specific'] },
    value: { type: Number },
    date: { type: Date },
    sent: { type: Boolean, default: false },
});



// 🆕 Updated remarks schema with timestamp
const followupRemarkSchema = new Schema<IFollowupRemark>({
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const followupSchema = new Schema<IFollowup>(
    {
        followupId: { type: String, required: true },
        lead: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
        addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        description: { type: String, required: true },
        type: { type: String, enum: ['Call', 'Email', 'WhatsApp'], required: true },
        followupDate: { type: Date, required: true },
        remarks: [followupRemarkSchema], // 🆕 Array of remarks with timestamps
        stage: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
        reminders: [followupReminderSchema],
    },
    { timestamps: true }
);

export default mongoose.models.Followup || model<IFollowup>('Followup', followupSchema);
