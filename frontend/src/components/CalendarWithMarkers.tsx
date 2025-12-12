"use client";

interface CalendarWithMarkersProps {
  currentDate?: Date;
  markedDates: string[]; // Array of ISO date strings like "2025-11-26"
  onDateClick?: (date: Date) => void;
}

export default function CalendarWithMarkers({
  currentDate = new Date(),
  markedDates,
  onDateClick,
}: CalendarWithMarkersProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get month name
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Convert markedDates to a Set for fast lookup
  const markedDatesSet = new Set(markedDates);

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add actual days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDayClick = (day: number | null) => {
    if (day === null || !onDateClick) return;
    const clickedDate = new Date(year, month, day);
    onDateClick(clickedDate);
  };

  const formatDateToISO = (day: number): string => {
    const date = new Date(year, month, day);
    return date.toISOString().slice(0, 10);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {monthName} {year}
        </h3>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-slate-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateISO = formatDateToISO(day);
          const isMarked = markedDatesSet.has(dateISO);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={!onDateClick}
              className={`
                aspect-square p-1 rounded-lg text-sm font-medium
                transition-all duration-200
                ${onDateClick ? "cursor-pointer hover:bg-slate-100" : "cursor-default"}
                ${isTodayDate ? "ring-2 ring-indigo-500" : ""}
                ${isMarked ? "bg-indigo-100 text-indigo-900 font-bold" : "text-slate-700"}
                ${isMarked && onDateClick ? "hover:bg-indigo-200" : ""}
                relative
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{day}</span>
                {isMarked && (
                  <div className="w-1 h-1 bg-indigo-600 rounded-full mt-0.5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-indigo-500" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-indigo-100" />
          <span>Has entries</span>
        </div>
      </div>
    </div>
  );
}
