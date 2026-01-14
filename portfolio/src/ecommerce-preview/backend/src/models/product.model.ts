import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
    userId: Types.ObjectId;
    title: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    status: 'draft' | 'active' | 'archived';
    priority: 'low' | 'medium' | 'high';
    category: string;
    tags: string[];
    images: string[];
    stock: number;
    sku?: string;
    metadata: Record<string, any>;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            maxlength: [5000, 'Description cannot exceed 5000 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        compareAtPrice: {
            type: Number,
            min: [0, 'Compare at price cannot be negative'],
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'archived'],
            default: 'draft',
            index: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            index: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        images: {
            type: [String],
            default: [],
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, 'Stock cannot be negative'],
        },
        sku: {
            type: String,
            unique: true,
            sparse: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for common queries
productSchema.index({ userId: 1, status: 1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.compareAtPrice && this.compareAtPrice > this.price) {
        return Math.round((1 - this.price / this.compareAtPrice) * 100);
    }
    return 0;
});

// Exclude soft-deleted by default
productSchema.pre('find', function () {
    this.where({ isDeleted: { $ne: true } });
});

productSchema.pre('findOne', function () {
    this.where({ isDeleted: { $ne: true } });
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
