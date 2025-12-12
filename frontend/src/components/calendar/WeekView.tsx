"use client";

import { CalendarEvent, DiaryEntry } from "@/lib/calendar-utils";
import {
  getWeekDays,
  isSameDay,
  isToday,
  getEventsForDate,
  getDiaryEntriesForDate,
  getShortDayName,
  formatTime,
} from "@/lib/calendar-utils";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  diaryEntries: DiaryEntry[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function WeekView({
  currentDate,
  events,
  diaryEntries,
  selectedDate,
  onDateClick,
  onEventClick,
}: WeekViewProps) {
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((date, index) => {
          const isTodayDate = isToday(date);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

          return (
            <div
              key={index}
              className={`
                p-3 text-center border-r cursor-pointer
                transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
                ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
              `}
              onClick={() => onDateClick(date)}
            >
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {getShortDayName(date.getDay())}
              </div>
              <div
                className={`
                  text-lg font-semibold
                  ${isTodayDate ? "bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto" : ""}
                `}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 flex-1 border-l">
        {weekDays.map((date, index) => {
          const dateEvents = getEventsForDate(events, date);
          const dateDiaryEntries = getDiaryEntriesForDate(diaryEntries, date);

          return (
            <div
              key={index}
              className="border-r p-2 overflow-y-auto"
            >
              {/* Events */}
              <div className="space-y-2">
                {dateEvents.map((event: any) => {
                  const eventColor = event.userCalendar?.color || "#3B82F6";
                  const lightColor = `${eventColor}20`;
                  
                  return (
                    <div
                      key={event.id}
                      className="px-2 py-2 rounded cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: lightColor,
                        borderLeft: `3px solid ${eventColor}`,
                        color: eventColor,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="font-semibold text-sm">{event.title}</div>
                      {!event.allDay && event.startTime && (
                        <div className="text-xs opacity-75">
                          {formatTime(new Date(event.startTime))}
                          {event.endTime && ` - ${formatTime(new Date(event.endTime))}`}
                        </div>
                      )}
                      {event.allDay && (
                        <div className="text-xs opacity-75">All day</div>
                      )}
                    </div>
                  );
                })}

                {/* Diary entries indicator */}
                {dateDiaryEntries.length > 0 && (
                  <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded text-xs">
                    📔 {dateDiaryEntries.length} diary {dateDiaryEntries.length === 1 ? "entry" : "entries"}
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
