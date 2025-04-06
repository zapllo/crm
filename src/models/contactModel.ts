// models/contactModel.ts
import mongoose, { Schema, model, Document } from 'mongoose';
import { ICompany } from './companyModel';

interface ICustomFieldValue {
    definition: mongoose.Types.ObjectId; // references ContactCustomFieldDefinition
    value: any; // store the user’s answer
}

interface IContact extends Document {
    company: mongoose.Types.ObjectId | ICompany;
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    whatsappNumber: string;
    state: string;
    city: string;
    pincode: string;
    address: string;
    dateOfBirth?: Date;
    dateOfAnniversary?: Date;

    // NEW:
    customFieldValues?: ICustomFieldValue[];
    // NEW
    tags?: mongoose.Types.ObjectId[]; // an array of ContactTag._id
}

const contactSchema = new Schema<IContact>(
    {
        company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        country: { type: String, required: true },
        whatsappNumber: { type: String, required: true },
        state: { type: String },
        city: { type: String},
        pincode: { type: String },
        address: { type: String},
        dateOfBirth: { type: Date },
        dateOfAnniversary: { type: Date },

        // NEW:
        customFieldValues: [
            {
                definition: {
                    type: Schema.Types.ObjectId,
                    ref: 'ContactCustomFieldDefinition',
                    required: true,
                },
                value: Schema.Types.Mixed,
            },
        ],
        tags: [{ type: Schema.Types.ObjectId, ref: "ContactTag" }],
    },
    { timestamps: true }
);

export default mongoose.models.Contact ||
    model<IContact>('Contact', contactSchema);
