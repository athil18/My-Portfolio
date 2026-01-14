import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
    user: Types.ObjectId;
    token: string;
    device: string;
    browser: string;
    os: string;
    ipAddress: string;
    lastActivity: Date;
    isCurrent: boolean;
    createdAt: Date;
    expiresAt: Date;
}

const sessionSchema = new Schema<ISession>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        device: {
            type: String,
            default: 'Unknown Device',
        },
        browser: {
            type: String,
            default: 'Unknown Browser',
        },
        os: {
            type: String,
            default: 'Unknown OS',
        },
        ipAddress: {
            type: String,
            default: 'Unknown',
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
        isCurrent: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            index: { expireAfterSeconds: 0 },
        },
    },
    { timestamps: true }
);

const Session = mongoose.model<ISession>('Session', sessionSchema);

export default Session;
