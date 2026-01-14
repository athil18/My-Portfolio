import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    data?: Record<string, any>; // Optional JSON data for navigation/actions
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error'],
            required: true,
            default: 'info',
        },
        title: {
            type: String,
            required: true,
            maxlength: 100,
        },
        message: {
            type: String,
            required: true,
            maxlength: 500,
        },
        data: {
            type: Schema.Types.Mixed,
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient querying
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
