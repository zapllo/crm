import mongoose, { Schema, model, models } from "mongoose";

const StageSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, default: "#000000" }, 
  won: { type: Boolean, default: false },  // New field to differentiate won/lost
  lost: { type: Boolean, default: false }  // New field to differentiate won/lost
});

const PipelineSchema = new Schema({
  name: { type: String, required: true },
  organization: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  openStages: [StageSchema],
  closeStages: [StageSchema],
  customFields: [
    {
      name: String,
      type: { type: String, enum: ["Text", "Date", "Number", "MultiSelect"] },
      options: [String],
    },
  ],
  leads: [{ type: Schema.Types.ObjectId, ref: "Lead" }], 
});

export default models.Pipeline || model("Pipeline", PipelineSchema);
