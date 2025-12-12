"use client";

import { CalendarEvent, DiaryEntry } from "@/lib/calendar-utils";
import {
  getMonthDays,
  isSameDay,
  isToday,
  formatDateForAPI,
  getEventsForDate,
  getDiaryEntriesForDate,
  getShortDayName,
} from "@/lib/calendar-utils";

interface MonthViewProps {
  year: number;
  month: number;
  events: CalendarEvent[];
  diaryEntries: DiaryEntry[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
}

export default function MonthView({
  year,
  month,
  events,
  diaryEntries,
  selectedDate,
  onDateClick,
}: MonthViewProps) {
  const days = getMonthDays(year, month);
  const dayNames = Array.from({ length: 7 }, (_, i) => getShortDayName(i));

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 border-l border-t">
        {days.map((date, index) => {
          const dateEvents = getEventsForDate(events, date);
          const dateDiaryEntries = getDiaryEntriesForDate(diaryEntries, date);
          const isCurrentMonth = date.getMonth() === month;
          const isTodayDate = isToday(date);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          return (
            <div
              key={index}
              className={`
                min-h-[100px] border-r border-b p-2 cursor-pointer
                transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
                ${!isCurrentMonth ? "bg-gray-50 dark:bg-gray-900 text-gray-400" : ""}
                ${isSelected ? "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500" : ""}
              `}
              onClick={() => onDateClick(date)}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${isTodayDate ? "bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}
                    ${!isCurrentMonth && !isTodayDate ? "text-gray-400" : ""}
                  `}
                >
                  {date.getDate()}
                </span>
                
                {/* Indicators */}
                <div className="flex gap-1">
                  {/* Show unique calendar colors as dots */}
                  {dateEvents.length > 0 && (() => {
                    const uniqueColors = Array.from(new Set(
                      dateEvents.map((e: any) => e.userCalendar?.color || "#3B82F6")
                    )).slice(0, 3);
                    
                    return uniqueColors.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                        title={`Events`}
                      />
                    ));
                  })()}
                  {dateDiaryEntries.length > 0 && (
                    <span className="w-2 h-2 bg-purple-500 rounded-full" title={`${dateDiaryEntries.length} diary entries`} />
                  )}
                </div>
              </div>

              {/* Event list (show up to 3) */}
              <div className="space-y-1">
                {dateEvents.slice(0, 3).map((event: any) => {
                  const eventColor = event.userCalendar?.color || "#3B82F6";
                  const lightColor = `${eventColor}20`;
                  
                  return (
                    <div
                      key={event.id}
                      className="text-xs px-2 py-1 rounded truncate"
                      style={{
                        backgroundColor: lightColor,
                        borderLeft: `3px solid ${eventColor}`,
                        color: eventColor,
                      }}
                      title={event.title}
                    >
                      {event.allDay ? "All day: " : ""}{event.title}
                    </div>
                  );
                })}
                {dateEvents.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                    +{dateEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
