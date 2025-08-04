import mongoose, { Schema, Document, model } from "mongoose";

interface IContactTag extends Document {
  name: string;
  color: string;
}

const contactTagSchema = new Schema<IContactTag>(
  {
    name: { type: String, required: true },
    color: { type: String, default: "#815bf5" },
  },
  { timestamps: true }
);

export default mongoose.models.ContactTag ||
  model<IContactTag>("ContactTag", contactTagSchema);
