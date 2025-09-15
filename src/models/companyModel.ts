// models/Company.ts
import mongoose, { Document, model, Model, Schema, Types } from "mongoose";

export interface ICompany extends Document {
  companyName: string;
  taxNo: string;
  companyCode: string;
  country: string;
  shippingAddress: string;
  billingAddress: string;
  state: string;
  city: string;
  website: string;
  pincode: string;
  organization: Types.ObjectId;
}

const companySchema = new Schema<ICompany>(
  {
    companyName: { type: String, required: true },
    taxNo: { type: String, },
    companyCode: { type: String,},
    country: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    billingAddress: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    website: { type: String },
    pincode: { type: String},
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true }
);


export default mongoose.models.Company || model<ICompany>('Company', companySchema);
