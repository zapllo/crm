import mongoose, { Schema, model, Document } from "mongoose";

export interface ISource extends Document {
  name: string;                            // e.g. "Website", "Referral", "Cold Call"
  organization: mongoose.Types.ObjectId;   // references the Organization model
}

const sourceSchema = new Schema<ISource>(
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

export default mongoose.models.Source ||
  model<ISource>("Source", sourceSchema);
