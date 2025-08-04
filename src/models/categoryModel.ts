import mongoose, { Schema, model, Document } from "mongoose";

export interface ICategory extends Document {
    name: string;                            // e.g. "Website", "Referral", "Cold Call"
    organization: mongoose.Types.ObjectId;   // references the Organization model
}

const categorySchema = new Schema<ICategory>(
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

export default mongoose.models.Category ||
    model<ICategory>("Category", categorySchema);
