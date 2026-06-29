import { create } from 'zustand';
import apiClient from '../services/api';

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    metadata?: Record<string, any>;
}

interface CalendarStore {
    events: CalendarEvent[];
    selectedDate: Date;
    isLoading: boolean;
    error: string | null;

    setSelectedDate: (date: Date) => void;
    addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
    updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    fetchEvents: (startDate: Date, endDate: Date) => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
    events: [],
    selectedDate: new Date(),
    isLoading: false,
    error: null,

    setSelectedDate: (date) => set({ selectedDate: date }),

    addEvent: async (event) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.post('/calendar', event);
            const created = response.data.data;
            const mapped: CalendarEvent = {
                id: created._id,
                title: created.title,
                description: created.description,
                startDate: new Date(created.startDate),
                endDate: new Date(created.endDate),
                metadata: created.metadata,
            };
            set((state) => ({
                events: [...state.events, mapped],
                isLoading: false,
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to add event', isLoading: false });
        }
    },

    updateEvent: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.patch(`/calendar/${id}`, data);
            const updated = response.data.data;
            const mapped: CalendarEvent = {
                id: updated._id,
                title: updated.title,
                description: updated.description,
                startDate: new Date(updated.startDate),
                endDate: new Date(updated.endDate),
                metadata: updated.metadata,
            };
            set((state) => ({
                events: state.events.map((event) => (event.id === id ? mapped : event)),
                isLoading: false,
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to update event', isLoading: false });
        }
    },

    deleteEvent: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.delete(`/calendar/${id}`);
            set((state) => ({
                events: state.events.filter((event) => event.id !== id),
                isLoading: false,
            }));
        } catch (err: any) {
            set({ error: err.response?.data?.message || 'Failed to delete event', isLoading: false });
        }
    },

    fetchEvents: async (startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiClient.get('/calendar', {
                params: {
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                },
            });
            const mappedEvents: CalendarEvent[] = response.data.data.map((evt: any) => ({
                id: evt._id,
                title: evt.title,
                description: evt.description,
                startDate: new Date(evt.startDate),
                endDate: new Date(evt.endDate),
                metadata: evt.metadata,
            }));
            set({ events: mappedEvents, isLoading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch events', isLoading: false });
        }
    },
}));
