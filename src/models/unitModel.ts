import mongoose, { Schema, model, Document } from "mongoose";

export interface IUnit extends Document {
    name: string;                            // e.g. "Website", "Referral", "Cold Call"
    organization: mongoose.Types.ObjectId;   // references the Organization model
}

const unitSchema = new Schema<IUnit>(
    {
        name: { type: String, required: true },
        organization: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Unit ||
    model<IUnit>("Unit", unitSchema);
