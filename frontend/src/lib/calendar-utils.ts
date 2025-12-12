// Calendar utility functions and types

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  date: Date | string;
  startTime: Date | string | null;
  endTime: Date | string | null;
  allDay: boolean;
  diaryEntryId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  diaryEntry?: {
    id: string;
    title: string;
    date: Date | string;
  };
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: Date | string;
  title: string;
  content: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  media?: Array<{
    id: string;
    type: "IMAGE" | "VIDEO";
    url: string;
  }>;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
  diaryEntries: DiaryEntry[];
}

export type ViewType = "month" | "week" | "day";

/**
 * Get the first day of the month
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get the last day of the month
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Get all days for a month view (including leading/trailing days)
 */
export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);
  
  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfWeek = firstDay.getDay();
  
  // Get the day of week for the last day
  const lastDayOfWeek = lastDay.getDay();
  
  const days: Date[] = [];
  
  // Add leading days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }
  
  // Add days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }
  
  // Add trailing days from next month
  const remainingDays = 6 - lastDayOfWeek;
  for (let day = 1; day <= remainingDays; day++) {
    days.push(new Date(year, month + 1, day));
  }
  
  return days;
}

/**
 * Get days for a week view
 */
export function getWeekDays(date: Date): Date[] {
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
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (e.g., "December 11, 2025")
 */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date for display (e.g., "Dec 11")
 */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
  const date = new Date(2000, month, 1);
  return date.toLocaleDateString("en-US", { month: "long" });
}

/**
 * Get day name
 */
export function getDayName(dayIndex: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayIndex];
}

/**
 * Get short day name
 */
export function getShortDayName(dayIndex: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayIndex];
}

/**
 * Filter events for a specific date
 */
export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isSameDay(eventDate, date);
  });
}

/**
 * Filter diary entries for a specific date
 */
export function getDiaryEntriesForDate(entries: DiaryEntry[], date: Date): DiaryEntry[] {
  return entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return isSameDay(entryDate, date);
  });
}

/**
 * Count events by date (for month view badges)
 */
export function countEventsByDate(events: CalendarEvent[]): Map<string, number> {
  const counts = new Map<string, number>();
  
  events.forEach((event) => {
    const dateKey = formatDateForAPI(new Date(event.date));
    counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
  });
  
  return counts;
}

/**
 * Count diary entries by date
 */
export function countDiaryEntriesByDate(entries: DiaryEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  
  entries.forEach((entry) => {
    const dateKey = formatDateForAPI(new Date(entry.date));
    counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
  });
  
  return counts;
}

/**
 * Get dates with entries (for mini calendar highlighting)
 */
export function getDatesWithEntries(entries: DiaryEntry[]): Set<string> {
  const dates = new Set<string>();
  
  entries.forEach((entry) => {
    const dateKey = formatDateForAPI(new Date(entry.date));
    dates.add(dateKey);
  });
  
  return dates;
}
