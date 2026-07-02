import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/response';
import { httpStatus } from '../utils/httpStatus';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../config/supabase';

export const createEvent = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { title, description, startDate, endDate, metadata } = req.body;

    if (!title || !startDate || !endDate) {
        return sendResponse(res, httpStatus.BAD_REQUEST, false, 'Title, startDate, and endDate are required');
    }

    const { data: event, error } = await supabaseAdmin
        .from('calendar_events')
        .insert({
            user_id: req.user.id,
            title,
            description,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            metadata: metadata || {},
        })
        .select()
        .single();

    if (error || !event) {
        return sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, false, 'Failed to create event');
    }

    sendResponse(res, httpStatus.CREATED, true, 'Event created successfully', { ...event, _id: event.id });
});

export const getEvents = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    
    const { start, end } = req.query;
    let query = supabaseAdmin
        .from('calendar_events')
        .select('*')
        .eq('user_id', req.user.id)
        .order('start_date', { ascending: true });

    if (start) query = query.gte('start_date', new Date(start as string).toISOString());
    if (end) query = query.lte('start_date', new Date(end as string).toISOString());

    const { data: events, error } = await query;

    if (error) {
        return sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, false, 'Failed to fetch events');
    }

    sendResponse(res, httpStatus.OK, true, 'Events fetched successfully', (events || []).map(e => ({ ...e, _id: e.id })));
});

export const updateEvent = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { id } = req.params;
    const { title, description, startDate, endDate, metadata } = req.body;

    const updates: any = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (startDate !== undefined) updates.start_date = new Date(startDate).toISOString();
    if (endDate !== undefined) updates.end_date = new Date(endDate).toISOString();
    
    if (metadata !== undefined) {
        const { data: existing } = await supabaseAdmin
            .from('calendar_events')
            .select('metadata')
            .eq('id', id)
            .eq('user_id', req.user.id)
            .single();
            
        if (existing) {
            updates.metadata = { ...existing.metadata, ...metadata };
        }
    }

    const { data: event, error } = await supabaseAdmin
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

    if (error || !event) {
        return sendResponse(res, httpStatus.NOT_FOUND, false, 'Event not found');
    }

    sendResponse(res, httpStatus.OK, true, 'Event updated successfully', { ...event, _id: event.id });
});

export const deleteEvent = catchAsync(async (req: AuthRequest, res: Response) => {
    if (!req.user) return sendResponse(res, httpStatus.UNAUTHORIZED, false, 'Not authenticated');
    const { id } = req.params;

    const { error, count } = await supabaseAdmin
        .from('calendar_events')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('user_id', req.user.id);

    if (error || count === 0) {
        return sendResponse(res, httpStatus.NOT_FOUND, false, 'Event not found');
    }

    sendResponse(res, httpStatus.OK, true, 'Event deleted successfully', null);
});
