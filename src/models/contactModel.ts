import mongoose, { Schema, model, Document } from 'mongoose';
import { ICompany } from './companyModel';

interface IContact extends Document {
    // Replaced companyName with a reference
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
}

const contactSchema = new Schema<IContact>(
    {
        company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        country: { type: String, required: true },
        whatsappNumber: { type: String, required: true, unique: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        address: { type: String, required: true },
        dateOfBirth: { type: Date },
        dateOfAnniversary: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models.Contact || model<IContact>('Contact', contactSchema);
