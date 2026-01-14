import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
    userId: mongoose.Types.ObjectId;
    filename: string;
    originalName: string;
    url: string;
    sizes?: {
        thumbnail?: string;
        medium?: string;
        large?: string;
    };
    publicId: string;
    size: number;
    mimeType: string;
    folder: 'products' | 'avatars' | 'documents';
    isOptimized: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        filename: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        sizes: {
            thumbnail: String,
            medium: String,
            large: String,
        },
        publicId: {
            type: String,
            required: true,
            unique: true,
        },
        size: {
            type: Number,
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        folder: {
            type: String,
            enum: ['products', 'avatars', 'documents'],
            required: true,
            index: true,
        },
        isOptimized: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient querying
fileSchema.index({ userId: 1, folder: 1 });

const File = mongoose.model<IFile>('File', fileSchema);

export default File;
