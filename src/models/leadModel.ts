import mongoose, { Schema, model, Document, Types } from 'mongoose';

interface ITimeline {
    stage: string;
    action: string;
    remark: string;
    timestamp: Date;
    movedBy: Types.ObjectId;
}

interface INote {
    text: string;
    audioLink?: string; // Optional audio recording link
    createdBy: string; // User who added the note
    timestamp: Date;
}

interface ILead extends Document {
    leadId: string;
    title: string;
    description: string;
    product: Schema.Types.ObjectId; // Reference to Product model
    contact: Schema.Types.ObjectId; // Reference to Contact model
    amount: number;
    closeDate: Date;
    source: Schema.Types.ObjectId;
    assignedTo: Schema.Types.ObjectId; // Reference to the pipeline
    remarks: string;
    pipeline: Schema.Types.ObjectId; // Reference to the pipeline
    organization: Schema.Types.ObjectId; // Reference to the pipeline
    stage: string; // Current stage
    timeline: ITimeline[]; // Stage change history
    followups: Schema.Types.ObjectId[]; // Array of followup IDs
    notes: INote[]; // Array of notes
    files: string[]; // Array of file URLs
    audioRecordings: string[]; // Array of audio recording URLs
    links: { url: string; title: string }[]; // Array of link objects with title
}

const timelineSchema = new Schema<ITimeline>({
    stage: { type: String, required: true },
    action: { type: String, required: true },
    remark: { type: String },
    movedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
});

const noteSchema = new Schema<INote>({
    text: { type: String },
    audioLink: { type: String },
    createdBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});


const leadSchema = new Schema<ILead>(
    {
        leadId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
        amount: { type: Number },
        closeDate: { type: Date },
        source: { type: Schema.Types.ObjectId, ref: "Source" },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
        remarks: { type: String },
        pipeline: { type: Schema.Types.ObjectId, ref: 'Pipeline', required: true },
        organization: { type: Schema.Types.ObjectId, ref: "Organization" },
        stage: { type: String, required: true, default: "" },
        timeline: [timelineSchema], // Array of timeline entries
        followups: [{ type: Schema.Types.ObjectId, ref: 'Followup' }], // Array of followup IDs
        notes: [noteSchema], // Array of notes
        files: [{ type: String }], // Array of file URLs
        audioRecordings: [{ type: String }], // Array of audio recording URLs
        links: [{
            url: { type: String, required: true },
            title: { type: String }
        }],
    },
    { timestamps: true }
);

export default mongoose.models.Lead || model<ILead>('Lead', leadSchema);