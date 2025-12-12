"use client";

import { CalendarEvent, DiaryEntry } from "@/lib/calendar-utils";
import {
  isSameDay,
  getEventsForDate,
  getDiaryEntriesForDate,
  formatTime,
  formatDateLong,
} from "@/lib/calendar-utils";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  diaryEntries: DiaryEntry[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function DayView({
  currentDate,
  events,
  diaryEntries,
  onEventClick,
}: DayViewProps) {
  const dateEvents = getEventsForDate(events, currentDate);
  const dateDiaryEntries = getDiaryEntriesForDate(diaryEntries, currentDate);

  // Separate all-day and timed events
  const allDayEvents = dateEvents.filter((e) => e.allDay);
  const timedEvents = dateEvents.filter((e) => !e.allDay).sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Date header */}
      <div className="p-4 border-b sticky top-0 bg-white dark:bg-gray-900 z-10">
        <h2 className="text-2xl font-bold">{formatDateLong(currentDate)}</h2>
      </div>

      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
            All-day events
          </h3>
          <div className="space-y-2">
            {allDayEvents.map((event: any) => {
              const eventColor = event.userCalendar?.color || "#3B82F6";
              const lightColor = `${eventColor}20`;
              
              return (
                <div
                  key={event.id}
                  className="px-3 py-2 rounded cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: lightColor,
                    borderLeft: `3px solid ${eventColor}`,
                    color: eventColor,
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="font-semibold">{event.title}</div>
                  {event.description && (
                    <div className="text-sm opacity-75 mt-1">{event.description}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timed events */}
      <div className="flex-1">
        {timedEvents.length > 0 ? (
          <div className="p-4 space-y-3">
            {timedEvents.map((event: any) => {
              const eventColor = event.userCalendar?.color || "#3B82F6";
              const lightColor = `${eventColor}20`;
              
              return (
                <div
                  key={event.id}
                  className="px-4 py-3 rounded cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: lightColor,
                    borderLeft: `4px solid ${eventColor}`,
                    color: eventColor,
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{event.title}</div>
                      {event.description && (
                        <div className="text-sm opacity-75 mt-1">{event.description}</div>
                      )}
                    </div>
                    <div className="text-sm font-medium ml-4 whitespace-nowrap">
                      {event.startTime && formatTime(new Date(event.startTime))}
                      {event.endTime && ` - ${formatTime(new Date(event.endTime))}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !allDayEvents.length && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No events scheduled for this day
            </div>
          )
        )}
      </div>

      {/* Diary entries */}
      {dateDiaryEntries.length > 0 && (
        <div className="p-4 border-t bg-purple-50 dark:bg-purple-900/10">
          <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
            📔 Diary Entries
          </h3>
          <div className="space-y-2">
            {dateDiaryEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-gray-800 px-3 py-2 rounded border border-purple-200 dark:border-purple-800"
              >
                <div className="font-semibold text-purple-900 dark:text-purple-100">
                  {entry.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {entry.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
