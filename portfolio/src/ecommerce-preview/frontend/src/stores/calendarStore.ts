import { create } from 'zustand';
import { format } from 'date-fns';

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

    // Actions
    setSelectedDate: (date: Date) => void;
    addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
    updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
    deleteEvent: (id: string) => void;
    fetchEvents: (startDate: Date, endDate: Date) => Promise<void>;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
    events: [],
    selectedDate: new Date(),
    isLoading: false,
    error: null,

    setSelectedDate: (date) => set({ selectedDate: date }),

    addEvent: (event) => {
        // Optimistic update
        const newEvent: CalendarEvent = {
            ...event,
            id: `temp-${Date.now()}`,
        };

        set((state) => ({
            events: [...state.events, newEvent],
        }));

        // TODO: Call API to persist
        // fetch('/api/v1/events', { method: 'POST', body: JSON.stringify(event) })
    },

    updateEvent: (id, data) => {
        set((state) => ({
            events: state.events.map((event) =>
                event.id === id ? { ...event, ...data } : event
            ),
        }));

        // TODO: Call API
    },

    deleteEvent: (id) => {
        set((state) => ({
            events: state.events.filter((event) => event.id !== id),
        }));

        // TODO: Call API
    },

    fetchEvents: async (startDate, endDate) => {
        set({ isLoading: true, error: null });

        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/v1/events?start=${startDate}&end=${endDate}`);
            // const data = await response.json();

            // Mock data for now
            const mockEvents: CalendarEvent[] = [
                {
                    id: '1',
                    title: 'Team Meeting',
                    description: 'Weekly sync',
                    startDate: new Date(),
                    endDate: new Date(),
                    metadata: { type: 'meeting' },
                },
            ];

            set({ events: mockEvents, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch events', isLoading: false });
        }
    },
}));
