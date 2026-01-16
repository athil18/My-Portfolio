import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEvent extends Document {
    userId?: mongoose.Types.ObjectId;
    guestId?: string;
    event: string;
    category: string;
    label?: string;
    value?: number;
    properties?: Record<string, any>;
    url: string;
    userAgent: string;
    ip?: string;
    timestamp: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        guestId: {
            type: String,
            index: true,
        },
        event: {
            type: String,
            required: true,
            index: true,
        },
        category: {
            type: String,
            required: true,
            index: true,
        },
        label: String,
        value: Number,
        properties: {
            type: Schema.Types.Mixed,
            default: {},
        },
        url: String,
        userAgent: String,
        ip: String,
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

analyticsEventSchema.index({ category: 1, event: 1 });
analyticsEventSchema.index({ timestamp: -1, event: 1 });

const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', analyticsEventSchema);

export default AnalyticsEvent;
