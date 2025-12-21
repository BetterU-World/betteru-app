"use client";

import { useState, useEffect } from "react";
import MonthView from "@/components/calendar/MonthView";
import WeekView from "@/components/calendar/WeekView";
import DayView from "@/components/calendar/DayView";
import DateDetailsPanel from "@/components/calendar/DateDetailsPanel";
import EventDialog from "@/components/calendar/EventDialog";
import { SuggestionsDialog } from "@/components/calendar/SuggestionsDialog";
import { Button } from "@/components/ui/button";
import type { CalendarEvent, DiaryEntry, ViewType } from "@/lib/calendar-utils";
import { getMonthName, formatDateForAPI, getEventsForDate, getDiaryEntriesForDate } from "@/lib/calendar-utils";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { CalendarSuggestion } from "@prisma/client";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showSuggestionsDialog, setShowSuggestionsDialog] = useState(false);
  const [suggestions, setSuggestions] = useState<CalendarSuggestion[]>([]);
  const [userCalendars, setUserCalendars] = useState<Array<{ id: string; name: string; color: string; type: string; slug: string | null; isVisible: boolean; eventCount: number }>>([]);
  const [userCalendarToggles, setUserCalendarToggles] = useState<Record<string, boolean>>({});
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  // Fetch events for the current month/week/day
  useEffect(() => {
    fetchEvents();
    fetchDiaryEntries();
    fetchSuggestions();
    fetchUserCalendars();
  }, [currentDate, currentView]);

  // No separate milestones toggle; milestones are part of Goals system calendar

  const fetchUserCalendars = async () => {
    try {
      const res = await fetch("/api/user-calendars");
      if (res.ok) {
        const data = await res.json();
        setUserCalendars(data);
        
        // Initialize all calendars as enabled
        const initialToggles: Record<string, boolean> = {};
        data.forEach((cal: { id: string }) => {
          initialToggles[cal.id] = true;
        });
        setUserCalendarToggles(initialToggles);
      }
    } catch (error) {
      console.error("Error fetching user calendars:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
      });
      
      const res = await fetch(`/api/calendar-events?${params}`);
      const data = await res.json();
      
      if (res.ok) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiaryEntries = async () => {
    try {
      const res = await fetch("/api/diary");
      const data = await res.json();
      
      if (res.ok) {
        setDiaryEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Error fetching diary entries:", error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      
      const res = await fetch(`/api/calendar-suggestions?month=${month}&year=${year}`);
      const data = await res.json();
      
      if (res.ok) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      const res = await fetch("/api/calendar-suggestions/generate", {
        method: "POST",
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      throw error;
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/calendar-suggestions/${suggestionId}/accept`, {
        method: "POST",
      });
      
      if (res.ok) {
        await fetchEvents();
        await fetchSuggestions();
      }
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      throw error;
    }
  };

  const handleDismissSuggestion = async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/calendar-suggestions/${suggestionId}/dismiss`, {
        method: "POST",
      });
      
      if (res.ok) {
        await fetchSuggestions();
      }
    } catch (error) {
      console.error("Error dismissing suggestion:", error);
      throw error;
    }
  };

  const handlePrevious = () => {
    if (currentView === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (currentView === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (currentView === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (currentView === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventDialog(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    if ((event as any).type === "goal_milestone") {
      // Milestones are read-only in the calendar; do not open editor
      return;
    }
    setEditingEvent(event);
    setShowEventDialog(true);
  };

  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      if (editingEvent) {
        // Update existing event
        const res = await fetch(`/api/calendar-events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (res.ok) {
          await fetchEvents();
          setShowEventDialog(false);
          setEditingEvent(null);
        }
      } else {
        // Create new event
        const res = await fetch("/api/calendar-events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });

        if (res.ok) {
          await fetchEvents();
          setShowEventDialog(false);
        }
      }
    } catch (error) {
      console.error("Error saving event:", error);
      throw error;
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;

    try {
      const res = await fetch(`/api/calendar-events/${editingEvent.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchEvents();
        setShowEventDialog(false);
        setEditingEvent(null);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  };

  const handleClosePanel = () => {
    setSelectedDate(null);
  };

  // Get title for current view
  const getViewTitle = () => {
    if (currentView === "month") {
      return `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
    } else if (currentView === "week") {
      const weekDays = getWeekDays(currentDate);
      const start = weekDays[0];
      const end = weekDays[6];
      return `${getMonthName(start.getMonth())} ${start.getDate()} - ${getMonthName(end.getMonth())} ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Get helper function for week days
  const getWeekDays = (date: Date): Date[] => {
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Filter events based on active calendar toggles
  const filteredEvents = events.filter((event: any) => {
    // If event has no calendar, always show it
    if (!event.userCalendarId) return true;
    // Otherwise, check if the calendar is toggled on
    return userCalendarToggles[event.userCalendarId] !== false;
  });

  // Get filtered events and diary entries for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(filteredEvents, selectedDate) : [];
  const selectedDateDiaryEntries = selectedDate ? getDiaryEntriesForDate(diaryEntries, selectedDate) : [];

  const handleCalendarToggle = async (calendarId: string) => {
    const newVisibility = !userCalendarToggles[calendarId];
    
    // Update local state immediately for responsiveness
    setUserCalendarToggles((prev) => ({
      ...prev,
      [calendarId]: newVisibility,
    }));

    // Update isVisible in database
    try {
      await fetch(`/api/user-calendars/${calendarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: newVisibility }),
      });
    } catch (error) {
      console.error("Error toggling calendar visibility:", error);
      // Revert on error
      setUserCalendarToggles((prev) => ({
        ...prev,
        [calendarId]: !newVisibility,
      }));
    }
  };

  const handleToggleAllCalendars = async () => {
    if (!userCalendars || userCalendars.length === 0) return;
    const areAllVisible = userCalendars.every((cal) => userCalendarToggles[cal.id] !== false);
    const newVisibility = !areAllVisible;

    // Optimistically update all toggles locally
    setUserCalendarToggles((prev) => {
      const next: Record<string, boolean> = { ...prev };
      userCalendars.forEach((cal) => {
        next[cal.id] = newVisibility;
      });
      return next;
    });

    // Persist visibility for each calendar
    try {
      await Promise.allSettled(
        userCalendars.map((cal) =>
          fetch(`/api/user-calendars/${cal.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isVisible: newVisibility }),
          })
        )
      );
    } catch (error) {
      console.error("Error toggling all calendars:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
          {/* Calendar header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">{getViewTitle()}</h1>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View switcher */}
              <div className="flex gap-2">
                <Button
                  variant={currentView === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("month")}
                >
                  Month
                </Button>
                <Button
                  variant={currentView === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("week")}
                >
                  Week
                </Button>
                <Button
                  variant={currentView === "day" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView("day")}
                >
                  Day
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowLayersPanel(!showLayersPanel)}
                >
                  Calendars ({userCalendars.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSuggestionsDialog(true)}
                  className="relative"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggestions
                  {suggestions.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {suggestions.length}
                    </span>
                  )}
                </Button>
                <Button onClick={handleAddEvent}>
                  Add Event
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Layers Panel */}
          {showLayersPanel && (userCalendars.length > 0 || true) && (
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
              {/* User Calendars */}
              {userCalendars.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">My Calendars</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleAllCalendars}
                        title="Toggle visibility of all calendars"
                      >
                        Toggle All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => (window.location.href = "/calendars")}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {userCalendars.map((calendar) => (
                      <div
                        key={calendar.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => handleCalendarToggle(calendar.id)}
                      >
                        <input
                          type="checkbox"
                          checked={userCalendarToggles[calendar.id] !== false}
                          onChange={() => handleCalendarToggle(calendar.id)}
                          className="w-4 h-4 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: calendar.color }}
                        />
                        <span className="text-sm truncate flex-1">{calendar.name}</span>
                        <span className="text-xs text-gray-500">({calendar.eventCount})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calendar content */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-hidden">
              {currentView === "month" && (
                <MonthView
                  year={currentDate.getFullYear()}
                  month={currentDate.getMonth()}
                  events={filteredEvents}
                  diaryEntries={diaryEntries}
                  selectedDate={selectedDate}
                  onDateClick={handleDateClick}
                />
              )}

              {currentView === "week" && (
                <WeekView
                  currentDate={currentDate}
                  events={filteredEvents}
                  diaryEntries={diaryEntries}
                  selectedDate={selectedDate}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                />
              )}

              {currentView === "day" && (
                <DayView
                  currentDate={currentDate}
                  events={filteredEvents}
                  diaryEntries={diaryEntries}
                  onEventClick={handleEventClick}
                />
              )}
            </div>

            {/* Date details panel */}
            {selectedDate && (
              <DateDetailsPanel
                date={selectedDate}
                events={selectedDateEvents}
                diaryEntries={selectedDateDiaryEntries}
                onClose={handleClosePanel}
                onAddEvent={handleAddEvent}
                onEventClick={handleEventClick}
              />
            )}
          </div>
        </div>
      </main>

      {/* Event dialog */}
      <EventDialog
        isOpen={showEventDialog}
        onClose={() => {
          setShowEventDialog(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
        event={editingEvent}
        selectedDate={selectedDate || undefined}
      />

      {/* Suggestions dialog */}
      <SuggestionsDialog
        isOpen={showSuggestionsDialog}
        onClose={() => setShowSuggestionsDialog(false)}
        suggestions={suggestions}
        onAccept={handleAcceptSuggestion}
        onDismiss={handleDismissSuggestion}
        onGenerate={handleGenerateSuggestions}
      />
    </div>
  );
}
