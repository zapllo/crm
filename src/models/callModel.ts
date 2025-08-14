import mongoose, { Schema, model, Document } from 'mongoose';

export interface ICall extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  contactId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  twilioCallSid: string;
  twilioRecordingSid?: string;
  recordingUrl?: string;
  phoneNumber?: string;
  duration: number; // in seconds
  direction: 'inbound' | 'outbound';
  status: 'queued' | 'initiated' | 'scheduled' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';
  notes?: string;
  transcription?: string;
  summary?: string;
  outcome?: 'Success' | 'Follow-up' | 'Interested' | 'Declined' | 'Inquiry' | 'Support' | 'Complaint' | 'Cancelled';
  sentiment?: {
    score: number; // -1 to 1
    analysis: string; // positive, negative, neutral
  };
  tags?: string[];
  cost: number; // in cents
  startTime: Date;
  endTime?: Date;
  contactName?: string;
  customMessage?: string;
  scheduledFor?: Date;
}

const callSchema = new Schema<ICall>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    twilioCallSid: { type: String, required: true },
    twilioRecordingSid: { type: String },
    recordingUrl: { type: String },
    phoneNumber: { type: String },
    contactName: { type: String },
    customMessage: { type: String },
    scheduledFor: { type: Date },
    duration: { type: Number, default: 0 },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    status: {
      type: String,
      enum: ['queued', 'scheduled', 'initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer', 'canceled'],
      required: true
    },
    notes: { type: String },
    transcription: {
      type: String,
      default: null
    },
    summary: {
      type: String,
      default: null
    },
    outcome: {
      type: String,
      enum: ['Success', 'Follow-up', 'Interested', 'Declined', 'Inquiry', 'Support', 'Complaint', 'Cancelled'],
      default: null
    },
    sentiment: {
      score: { type: Number },
      analysis: { type: String, enum: ['positive', 'negative', 'neutral'] }
    },
    tags: [{ type: String }],
    cost: { type: Number, default: 0 },
    startTime: { type: Date, required: true },
    endTime: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.Call || model<ICall>('Call', callSchema);