import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/calendar/Card';
import { Input } from '@/components/calendar/Input';
import { useCalendarStore } from '@/stores/calendarStore';
import '@/styles/calendar-tokens.css';

export default function CalendarPage() {
    const {
        events,
        selectedDate,
        setSelectedDate,
        addEvent,
        fetchEvents,
        isLoading,
    } = useCalendarStore();

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDescription, setNewEventDescription] = useState('');

    useEffect(() => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        fetchEvents(start, end);
    }, [currentMonth, fetchEvents]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setShowEventModal(true);
    };

    const handleCreateEvent = () => {
        if (!newEventTitle.trim()) return;

        addEvent({
            title: newEventTitle,
            description: newEventDescription,
            startDate: selectedDate,
            endDate: selectedDate,
        });

        setNewEventTitle('');
        setNewEventDescription('');
        setShowEventModal(false);
    };

    const selectedDayEvents = events.filter((event) =>
        isSameDay(new Date(event.startDate), selectedDate)
    );

    return (
        <div className="min-h-screen bg-gradient-primary">
            {/* Glassmorphic Navbar */}
            <nav className="glass-navbar fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-white">Calendar</h1>
                    <Button variant="cta" size="sm" onClick={() => setShowEventModal(true)}>
                        <PlusIcon className="w-4 h-4" />
                        New Event
                    </Button>
                </div>
            </nav>

            <div className="pt-24 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                    {/* Main Calendar */}
                    <Card variant="glass" className="h-fit">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                    <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Days */}
                            <div className="grid grid-cols-7 gap-2">
                                {days.map((day) => {
                                    const hasEvents = events.some((event) =>
                                        isSameDay(new Date(event.startDate), day)
                                    );
                                    const isSelected = isSameDay(day, selectedDate);
                                    const isDayToday = isToday(day);

                                    return (
                                        <button
                                            key={day.toString()}
                                            onClick={() => handleDateClick(day)}
                                            className={`
                        relative aspect-square rounded-lg p-2 text-sm transition-all hover-glow
                        ${isSelected
                                                    ? 'bg-[#a29bfe] text-white font-semibold'
                                                    : isDayToday
                                                        ? 'bg-[#ffcc00] text-gray-900 font-medium'
                                                        : 'bg-white/5 text-white hover:bg-white/10'
                                                }
                      `}
                                        >
                                            <span className="block">{format(day, 'd')}</span>
                                            {hasEvents && (
                                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#ffcc00]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Sidebar */}
                    <div className="space-y-4">
                        <Card variant="glass">
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {format(selectedDate, 'MMM dd, yyyy')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedDayEvents.length === 0 ? (
                                    <p className="text-white/60 text-sm">No events today</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedDayEvents.map((event) => (
                                            <div
                                                key={event.id}
                                                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-[#a29bfe] transition-all"
                                            >
                                                <h4 className="font-medium text-white">{event.title}</h4>
                                                {event.description && (
                                                    <p className="text-sm text-white/60 mt-1">{event.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Event Creation Modal */}
                {showEventModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card variant="elevated" className="max-w-md w-full">
                            <CardHeader>
                                <CardTitle>Create Event</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    label="Title"
                                    value={newEventTitle}
                                    onChange={(e) => setNewEventTitle(e.target.value)}
                                    placeholder="Event title"
                                />
                                <Input
                                    label="Description (optional)"
                                    value={newEventDescription}
                                    onChange={(e) => setNewEventDescription(e.target.value)}
                                    placeholder="Add description"
                                />
                                <div className="flex gap-2 justify-end pt-4">
                                    <Button variant="ghost" onClick={() => setShowEventModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="primary" onClick={handleCreateEvent}>
                                        Create
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
