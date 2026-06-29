import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import CalendarEvent from '../models/calendarEvent.model';

export const createEvent = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { title, description, startDate, endDate, metadata } = req.body;

    if (!title || !startDate || !endDate) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Title, startDate, and endDate are required');
    }

    const event = await CalendarEvent.create({
        userId: req.user.id,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        metadata: metadata || {},
    });

    sendResponse(res, httpStatus.CREATED, true, 'Event created successfully', event);
});

export const getEvents = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    
    const { start, end } = req.query;
    const query: any = { userId: req.user.id };

    if (start || end) {
        query.startDate = {};
        if (start) query.startDate.$gte = new Date(start as string);
        if (end) query.startDate.$lte = new Date(end as string);
    }

    const events = await CalendarEvent.find(query).sort({ startDate: 1 });
    sendResponse(res, httpStatus.OK, true, 'Events fetched successfully', events);
});

export const updateEvent = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { id } = req.params;
    const { title, description, startDate, endDate, metadata } = req.body;

    const event = await CalendarEvent.findOne({ _id: id, userId: req.user.id });
    if (!event) {
        return sendResponse(res, httpStatus.NOT_FOUND, false, 'Event not found');
    }

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (startDate !== undefined) event.startDate = new Date(startDate);
    if (endDate !== undefined) event.endDate = new Date(endDate);
    if (metadata !== undefined) event.metadata = { ...event.metadata, ...metadata };

    await event.save();
    sendResponse(res, httpStatus.OK, true, 'Event updated successfully', event);
});

export const deleteEvent = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { id } = req.params;

    const result = await CalendarEvent.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!result) {
        return sendResponse(res, httpStatus.NOT_FOUND, false, 'Event not found');
    }

    sendResponse(res, httpStatus.OK, true, 'Event deleted successfully', null);
});
