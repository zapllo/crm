import mongoose, { Schema, model, models } from "mongoose";

const TagSchema = new Schema(
    {
        name: { type: String, required: true },
        color: { type: String, required: true }, // Hex code for the color
    },
    { timestamps: true }
);

export default models.Tag || model("Tag", TagSchema);
