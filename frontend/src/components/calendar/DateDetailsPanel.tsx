"use client";

import { CalendarEvent, DiaryEntry, formatDateLong, formatTime } from "@/lib/calendar-utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DateDetailsPanelProps {
  date: Date | null;
  events: CalendarEvent[];
  diaryEntries: DiaryEntry[];
  onClose: () => void;
  onAddEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function DateDetailsPanel({
  date,
  events,
  diaryEntries,
  onClose,
  onAddEvent,
  onEventClick,
}: DateDetailsPanelProps) {
  if (!date) return null;

  return (
    <div className="w-80 border-l bg-white dark:bg-gray-900 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">{formatDateLong(date)}</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Events section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              Events ({events.length})
            </h3>
            <Button size="sm" onClick={onAddEvent}>
              Add Event
            </Button>
          </div>

          {events.length > 0 ? (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => onEventClick(event)}
                >
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    {event.title}
                  </div>
                  
                  {!event.allDay && event.startTime && (
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {formatTime(new Date(event.startTime))}
                      {event.endTime && ` - ${formatTime(new Date(event.endTime))}`}
                    </div>
                  )}
                  
                  {event.allDay && (
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      All day
                    </div>
                  )}
                  
                  {event.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {event.description}
                    </div>
                  )}

                  {event.diaryEntry && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
                      📔 Linked to diary entry
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
              No events scheduled
            </p>
          )}
        </div>

        {/* Diary entries section */}
        <div>
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
            📔 Diary Entries ({diaryEntries.length})
          </h3>

          {diaryEntries.length > 0 ? (
            <div className="space-y-2">
              {diaryEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-3"
                >
                  <div className="font-medium text-purple-900 dark:text-purple-100">
                    {entry.title}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                    {entry.content}
                  </div>
                  {entry.media && entry.media.length > 0 && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      {entry.media.length} attachment{entry.media.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
              No diary entries for this date
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
