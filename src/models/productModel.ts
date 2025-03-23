import mongoose, { Schema, model, Document } from 'mongoose';

interface IProduct extends Document {
    productName: string;
    hsnCode: string;
    category: Schema.Types.ObjectId; // Reference to Product model
    unit: Schema.Types.ObjectId; // Reference to Product model
    rate: number;
    maxDiscount?: number;
    description?: string;
    imageUrl?: string;
}

const productSchema = new Schema<IProduct>(
    {
        productName: { type: String, required: true, unique: true },
        hsnCode: { type: String, required: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
        rate: { type: Number, required: true },
        maxDiscount: { type: Number },
        description: { type: String },
        imageUrl: { type: String }, // Image upload URL
    },
    { timestamps: true }
);

export default mongoose.models.Product || model<IProduct>('Product', productSchema);
