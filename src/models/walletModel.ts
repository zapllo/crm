import mongoose, { Schema, model, Document } from 'mongoose';

export interface IWalletTransaction extends Document {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  paymentId?: string;
  reference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IWallet extends Document {
  organizationId: mongoose.Types.ObjectId;
  balance: number; // in smallest currency unit (cents/paise)
  currency: string;
  lastUpdated: Date;
  transactions: IWalletTransaction[];
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    paymentId: { type: String },
    reference: { type: String },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
  }
);

const walletSchema = new Schema<IWallet>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    lastUpdated: { type: Date, default: Date.now },
    transactions: [walletTransactionSchema]
  },
  { timestamps: true }
);

export default mongoose.models.Wallet || model<IWallet>('Wallet', walletSchema);