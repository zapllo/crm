import mongoose, { Schema, model, Document } from 'mongoose';

interface IProduct extends Document {
    productName: string;
    hsnCode: string;
    category: string;
    unit: string;
    rate: number;
    maxDiscount?: number;
    description?: string;
    imageUrl?: string;
}

const productSchema = new Schema<IProduct>(
    {
        productName: { type: String, required: true, unique: true },
        hsnCode: { type: String, required: true },
        category: { type: String, required: true },
        unit: { type: String, required: true },
        rate: { type: Number, required: true },
        maxDiscount: { type: Number },
        description: { type: String },
        imageUrl: { type: String }, // Image upload URL
    },
    { timestamps: true }
);

export default mongoose.models.Product || model<IProduct>('Product', productSchema);
