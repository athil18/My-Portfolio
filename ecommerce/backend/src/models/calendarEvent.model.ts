import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICalendarEvent extends Document {
    userId: Types.ObjectId;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const calendarEventSchema = new Schema<ICalendarEvent>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for faster queries in specific date ranges per user
calendarEventSchema.index({ userId: 1, startDate: 1, endDate: 1 });

const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', calendarEventSchema);

export default CalendarEvent;
