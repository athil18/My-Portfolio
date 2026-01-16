import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    orderId?: mongoose.Types.ObjectId;
    stripePaymentId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'failed' | 'requires_action' | 'canceled' | 'refunded';
    paymentMethod?: string;
    receiptUrl?: string;
    metadata?: Record<string, any>;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            index: true,
        },
        stripePaymentId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'usd',
        },
        status: {
            type: String,
            enum: ['pending', 'succeeded', 'failed', 'requires_action', 'canceled', 'refunded'],
            default: 'pending',
            index: true,
        },
        paymentMethod: String,
        receiptUrl: String,
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        error: String,
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
