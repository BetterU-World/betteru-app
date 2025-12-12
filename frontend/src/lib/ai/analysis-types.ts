/**
 * AI Analysis Types & Mappers
 * 
 * This module provides types and helper functions to prepare BetterU data
 * for future AI assistant analysis. The AI assistant (when implemented) will
 * consume AnalyzableItem objects to understand user patterns, moods, and behaviors.
 * 
 * These are pure mapper functions - they do not perform database operations.
 */

import type { DiaryEntry, Habit, Goal, CalendarEvent, GoalStep, UserCalendar } from "@prisma/client";

/**
 * Source types that can be analyzed by the AI assistant
 */
export type AnalyzableSourceType =
  | "diary"
  | "habit"
  | "goal"
  | "calendar_event";

/**
 * Unified structure for AI analysis across all BetterU data types.
 * The AI assistant will consume arrays of these items to understand
 * user patterns, correlations, and provide insights.
 */
export interface AnalyzableItem {
  id: string;
  userId: string;
  sourceType: AnalyzableSourceType;
  date: Date;                     // Primary date for this item
  title?: string;                 // Optional title/name
  text: string;                   // Main content to analyze
  mood?: string | null;           // Optional mood (primarily for diary entries)
  tags?: string[];                // Optional tags for categorization
  metadata?: Record<string, any>; // Additional structured context
}

/**
 * Converts a DiaryEntry to an AnalyzableItem for AI processing.
 * 
 * Diary entries are the richest source of user reflection and will be
 * primary inputs for mood analysis, pattern detection, and insights.
 */
export function mapDiaryEntryToAnalyzableItem(
  entry: DiaryEntry
): AnalyzableItem {
  return {
    id: entry.id,
    userId: entry.userId,
    sourceType: "diary",
    date: entry.date,
    title: entry.title || undefined,
    text: entry.content,
    mood: (entry as any).mood || null,
    tags: (entry as any).tags || [],
    metadata: {
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    },
  };
}

/**
 * Converts a Habit to an AnalyzableItem for AI processing.
 * 
 * Habits will help the AI understand user routines, consistency patterns,
 * and correlate behaviors with mood and productivity.
 */
export function mapHabitToAnalyzableItem(
  habit: Habit,
  completionStats?: {
    streak: number;
    completionRate: number;
    lastCompletedDate?: Date;
  }
): AnalyzableItem {
  const descriptionText = habit.description || "";
  const frequencyText = habit.frequency === "daily" 
    ? "Daily habit"
    : habit.frequency === "weekly"
    ? `Weekly on ${habit.daysOfWeek.join(", ")}`
    : `Custom schedule: ${habit.daysOfWeek.join(", ")}`;

  return {
    id: habit.id,
    userId: habit.userId,
    sourceType: "habit",
    date: habit.createdAt,
    title: habit.title,
    text: `${descriptionText}\n${frequencyText}`,
    metadata: {
      frequency: habit.frequency,
      daysOfWeek: habit.daysOfWeek,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt,
      ...(completionStats && {
        streak: completionStats.streak,
        completionRate: completionStats.completionRate,
        lastCompletedDate: completionStats.lastCompletedDate,
      }),
    },
  };
}

/**
 * Converts a Goal to an AnalyzableItem for AI processing.
 * 
 * Goals provide context for user aspirations and progress.
 * The AI can identify patterns in goal-setting and achievement.
 */
export function mapGoalToAnalyzableItem(
  goal: Goal & { GoalStep: GoalStep[] }
): AnalyzableItem {
  const statusText = `Status: ${goal.status}, Priority: ${goal.priority}, Progress: ${goal.progress}%`;
  const stepsText = goal.GoalStep.length > 0
    ? `\nSteps:\n${goal.GoalStep.map((s: GoalStep) => `- ${s.done ? "✓" : "○"} ${s.title}`).join("\n")}`
    : "";

  return {
    id: goal.id,
    userId: goal.userId,
    sourceType: "goal",
    date: goal.targetDate,
    title: goal.title,
    text: `${goal.description}\n${statusText}${stepsText}`,
    tags: [goal.category],
    metadata: {
      status: goal.status,
      priority: goal.priority,
      progress: goal.progress,
      category: goal.category,
      startDate: goal.startDate,
      targetDate: goal.targetDate,
      completedAt: goal.completedAt,
      stepsCompleted: goal.GoalStep.filter((s: GoalStep) => s.done).length,
      stepsTotal: goal.GoalStep.length,
    },
  };
}

/**
 * Converts a CalendarEvent to an AnalyzableItem for AI processing.
 * 
 * Calendar events provide context about user activities, commitments,
 * and schedule patterns.
 */
export function mapCalendarEventToAnalyzableItem(
  event: CalendarEvent & { userCalendar?: UserCalendar | null }
): AnalyzableItem {
  const timeInfo = event.allDay
    ? "All-day event"
    : event.startTime && event.endTime
    ? `${event.startTime.toLocaleTimeString()} - ${event.endTime.toLocaleTimeString()}`
    : event.startTime
    ? `Starting at ${event.startTime.toLocaleTimeString()}`
    : "";

  const calendarInfo = event.userCalendar
    ? `Calendar: ${event.userCalendar.name}`
    : "";

  return {
    id: event.id,
    userId: event.userId,
    sourceType: "calendar_event",
    date: event.date,
    title: event.title,
    text: `${event.description || ""}\n${timeInfo}\n${calendarInfo}`.trim(),
    metadata: {
      allDay: event.allDay,
      startTime: event.startTime,
      endTime: event.endTime,
      userCalendarId: event.userCalendarId,
      userCalendarName: event.userCalendar?.name,
      userCalendarColor: event.userCalendar?.color,
      diaryEntryId: event.diaryEntryId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    },
  };
}

/**
 * Builds a unified timeline of all user data within a date range.
 * This will be the main entry point for AI analysis.
 * 
 * TODO: Implement when we add the AI assistant feature.
 * 
 * Future implementation will:
 * 1. Load diary entries, habits, goals, calendar events in the date range
 * 2. Map each to AnalyzableItem using the helpers above
 * 3. Sort by date ascending
 * 4. Return the combined, chronological list
 * 
 * This allows the AI to see a complete picture of the user's life
 * and identify patterns across different data types.
 * 
 * @param userId - The user's ID
 * @param from - Start date (inclusive)
 * @param to - End date (inclusive)
 * @returns Promise<AnalyzableItem[]> - Chronologically sorted items
 */
export async function buildUserTimelineForRange(
  userId: string,
  from: Date,
  to: Date
): Promise<AnalyzableItem[]> {
  // TODO: Implement when we add the AI assistant feature.
  // Intention: load diary entries, habits, goals, calendar events,
  // map them to AnalyzableItem using the helpers above,
  // sort by date, and return the combined list.
  
  // Example future implementation:
  // const diaryEntries = await prisma.diaryEntry.findMany({ where: { userId, date: { gte: from, lte: to } } });
  // const habits = await prisma.habit.findMany({ where: { userId } });
  // const goals = await prisma.goal.findMany({ where: { userId, targetDate: { gte: from, lte: to } } });
  // const events = await prisma.calendarEvent.findMany({ where: { userId, date: { gte: from, lte: to } } });
  //
  // const items: AnalyzableItem[] = [
  //   ...diaryEntries.map(mapDiaryEntryToAnalyzableItem),
  //   ...habits.map(h => mapHabitToAnalyzableItem(h)),
  //   ...goals.map(mapGoalToAnalyzableItem),
  //   ...events.map(mapCalendarEventToAnalyzableItem),
  // ];
  //
  // return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return [];
}

/**
 * Helper to aggregate mood data from diary entries for pattern analysis.
 * 
 * TODO: Implement when we add the AI assistant feature.
 * This will help answer questions like:
 * - "What's my most common mood this month?"
 * - "Am I feeling happier than last year?"
 * - "When do I tend to feel anxious?"
 */
export async function analyzeMoodPatterns(
  userId: string,
  from: Date,
  to: Date
): Promise<Record<string, number>> {
  // TODO: Implement mood aggregation and pattern detection
  return {};
}

/**
 * Helper to find correlations between different data types.
 * 
 * TODO: Implement when we add the AI assistant feature.
 * Examples:
 * - "Do I have better moods on days I complete my morning routine?"
 * - "Are my goal completion rates higher when I write in my diary?"
 */
export async function findDataCorrelations(
  userId: string,
  from: Date,
  to: Date
): Promise<Array<{ correlation: string; strength: number; insight: string }>> {
  // TODO: Implement correlation analysis
  return [];
}
