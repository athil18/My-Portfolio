import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IOrderItem {
    product: Types.ObjectId;
    title: string;
    image: string;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    user: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
    stripeSessionId?: string;
    shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                title: { type: String, required: true },
                image: { type: String, required: true },
                quantity: { type: Number, required: true, min: 1 },
                price: { type: Number, required: true },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
            index: true,
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'paid', 'failed', 'refunded'],
            default: 'unpaid',
            index: true,
        },
        stripeSessionId: {
            type: String,
            index: true,
        },
        shippingAddress: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
