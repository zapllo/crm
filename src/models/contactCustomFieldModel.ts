// models/contactCustomFieldDefinition.ts
import mongoose, { Schema, model, Document } from 'mongoose';

interface IContactCustomFieldDefinition extends Document {
  name: string;  // e.g. "Favorite Color"
  fieldType: 'Text' | 'Number' | 'Date' | 'Dropdown';
  mandatory: boolean;    // if true, must be filled out in Add/Edit contact
  options?: string[];    // only relevant if fieldType = 'Dropdown'
  organization: mongoose.Types.ObjectId; // Add this field to link to organization
}

const contactCustomFieldDefinitionSchema = new Schema<IContactCustomFieldDefinition>(
  {
    name: { type: String, required: true },
    fieldType: {
      type: String,
      enum: ['Text', 'Number', 'Date', 'Dropdown'],
      default: 'Text',
    },
    mandatory: { type: Boolean, default: false },
    options: [{ type: String }], // for the dropdown choices, if any
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
  },
  },
  { timestamps: true }
);

export default mongoose.models.ContactCustomFieldDefinition ||
  model<IContactCustomFieldDefinition>(
    'ContactCustomFieldDefinition',
    contactCustomFieldDefinitionSchema
  );
