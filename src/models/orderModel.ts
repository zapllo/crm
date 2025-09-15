import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface IOrder extends Document {
    userId: Types.ObjectId; // Use Types.ObjectId instead of mongoose.Types.ObjectId
    orderId: string;
    paymentId: string;
    amount: number;
    planName: string;
    creditedAmount: number;
    createdAt: Date;
    subscribedUserCount: number;
    additionalUserCount: number;
    deduction: number;
}

const OrderSchema: Schema<IOrder> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
        orderId: {
            type: String,
            required: true,
        },
        paymentId: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        planName: {
            type: String,
            required: true,
        },
        creditedAmount: {
            type: Number,
        },
        subscribedUserCount: {
            type: Number,
            required: true
        }, // Number of users purchased for the plan'deduction: { type: Number, default: 0 }, // New field for the applied discount
        additionalUserCount: { type: Number, default:0}, // Number of users added in this purchase
        deduction: { type: Number, default: 0 }, // New field for the applied discount
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
