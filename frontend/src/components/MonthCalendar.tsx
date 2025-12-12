"use client";

import React from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  calendar: {
    color: string;
  };
}

interface MonthCalendarProps {
  currentDate: Date;
  eventsByDate: Record<string, CalendarEvent[]>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (date: Date) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
  currentDate,
  eventsByDate,
  onPrevMonth,
  onNextMonth,
  onDateClick,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month and days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Build array of dates to display (including leading/trailing empty cells)
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add actual days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthName = firstDayOfMonth.toLocaleString("default", {
    month: "long",
  });

  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day);
    onDateClick(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          &larr; Prev
        </button>
        <h3 className="text-xl font-semibold">
          {monthName} {year}
        </h3>
        <button
          onClick={onNextMonth}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Next &rarr;
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-20"></div>;
          }

          const date = new Date(year, month, day);
          const dateKey = formatDateKey(date);
          const events = eventsByDate[dateKey] || [];

          // Show up to 2 events as colored dots, then "+N more"
          const visibleEvents = events.slice(0, 2);
          const remainingCount = events.length - 2;

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className="h-20 border border-gray-200 rounded p-1 cursor-pointer hover:bg-gray-50 transition flex flex-col"
            >
              <div className="text-sm font-medium text-gray-700">{day}</div>
              <div className="flex-1 flex flex-col justify-center items-center space-y-1">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: event.calendar.color }}
                    title={event.title}
                  ></div>
                ))}
                {remainingCount > 0 && (
                  <div className="text-xs text-gray-500">
                    +{remainingCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthCalendar;
