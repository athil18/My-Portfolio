import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
    price: number;
}

export interface ICart extends Document {
    user: Types.ObjectId;
    items: ICartItem[];
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
});

const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true,
        },
        items: [cartItemSchema],
        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

cartSchema.pre('save', function () {
    this.totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;
