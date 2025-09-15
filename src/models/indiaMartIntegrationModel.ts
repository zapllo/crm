// models/IndiaMartIntegration.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IIndiaMartIntegration extends Document {
  userId: mongoose.Schema.Types.ObjectId;  // or organizationId if it's org-level
  apiKey: string;                         // e.g. IndiaMART key
  pipelineId: mongoose.Schema.Types.ObjectId;  // or organizationId if it's org-level
  // or any other fields you need (webhook secret, etc.)
  createdAt: Date;
  updatedAt: Date;
}

const IndiaMartIntegrationSchema = new Schema<IIndiaMartIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  apiKey: { type: String, required: true },
  // NEW: pipeline reference
  pipelineId: {
    type: Schema.Types.ObjectId,
    ref: "Pipeline",
    default: null,
  },
}, { timestamps: true });

export default mongoose.models.IndiaMartIntegration ||
  mongoose.model<IIndiaMartIntegration>("IndiaMartIntegration", IndiaMartIntegrationSchema);
