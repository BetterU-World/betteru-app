"use client";

import { useState } from "react";
import { getMonthDays, isSameDay, isToday, formatDateForAPI, getShortDayName, getMonthName } from "@/lib/calendar-utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MiniCalendarProps {
  datesWithEntries: Set<string>;
  datesWithSuggestions?: Set<string>;
  datesWithDailyState?: Set<string>;
  selectedDate?: string | null;
  onDateClick: (date: Date) => void;
  initialMonth?: Date;
}

export default function MiniCalendar({
  datesWithEntries,
  datesWithSuggestions = new Set(),
  datesWithDailyState = new Set(),
  selectedDate,
  onDateClick,
  initialMonth,
}: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(initialMonth || new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    onDateClick(today);
  };

  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const dayNames = Array.from({ length: 7 }, (_, i) => getShortDayName(i));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">
            {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={handleToday}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label="Go to today"
            title="Today"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
          </button>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
            {day.substring(0, 1)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dateKey = formatDateForAPI(date);
          const hasEntry = datesWithEntries.has(dateKey);
          const hasSuggestion = datesWithSuggestions.has(dateKey);
          const hasDailyState = datesWithDailyState.has(dateKey);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isTodayDate = isToday(date);
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={index}
              onClick={() => onDateClick(date)}
              className={`
                aspect-square text-xs rounded-md flex items-center justify-center relative
                transition-all duration-150
                ${!isCurrentMonth ? "text-gray-400 dark:text-gray-600 opacity-50" : "text-gray-700 dark:text-gray-300"}
                ${isTodayDate ? "bg-blue-100 dark:bg-blue-900/50 font-bold ring-1 ring-blue-400" : ""}
                ${isSelected && !isTodayDate ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20" : ""}
                ${hasEntry && !isTodayDate && !isSelected ? "font-semibold bg-purple-50/50 dark:bg-purple-900/10" : ""}
                ${!hasEntry && !isTodayDate && !isSelected ? "hover:bg-gray-100 dark:hover:bg-gray-700" : ""}
                ${hasEntry || isTodayDate || isSelected ? "hover:shadow-sm" : ""}
              `}
              title={
                hasEntry && hasSuggestion
                  ? "Has diary entries and suggestions"
                  : hasEntry
                  ? "Has diary entries"
                  : hasSuggestion
                  ? "Has suggestions"
                  : "No entries"
              }
            >
              {date.getDate()}
              {hasEntry && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-sm" />
              )}
              {hasSuggestion && (
                <span className="absolute bottom-0.5 left-1/2 translate-x-0.5 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-sm" />
              )}
              {hasDailyState && (
                <span className="absolute bottom-0.5 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
            <span>Entries</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            <span>Suggestions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>Logged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-blue-100 dark:bg-blue-900/50 rounded border border-blue-400" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 bg-purple-50 dark:bg-purple-900/20 rounded ring-2 ring-purple-500" />
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
