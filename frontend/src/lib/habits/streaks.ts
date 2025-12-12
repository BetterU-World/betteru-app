import prisma from "@/lib/prisma";

/**
 * Normalize a date to midnight UTC
 */
export function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Check if a habit is scheduled for a specific day
 */
export function isHabitScheduledForDay(
  habit: { frequency: string; daysOfWeek: string[] },
  date: Date
): boolean {
  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "weekly" || habit.frequency === "custom") {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayOfWeek = dayNames[date.getDay()];
    return habit.daysOfWeek.map((d) => d.toLowerCase()).includes(dayOfWeek);
  }

  return false;
}

/**
 * Get the current streak for a habit
 * Counts consecutive days back from today where habit was scheduled AND completed
 */
export async function getHabitStreak(habitId: string): Promise<number> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: {
      completions: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!habit) {
    return 0;
  }

  let streak = 0;
  const today = normalizeDate(new Date());
  const completionDates = new Set(
    habit.completions.map((c) => c.date.toISOString())
  );

  // Start from today and go backwards
  let currentDate = new Date(today);

  // Check backwards day by day
  for (let i = 0; i < 365; i++) {
    // Limit to 1 year max
    if (!isHabitScheduledForDay(habit, currentDate)) {
      // If habit wasn't scheduled for this day, skip it (don't break streak)
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }

    const dateKey = normalizeDate(currentDate).toISOString();

    if (completionDates.has(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Streak is broken
      break;
    }
  }

  return streak;
}

/**
 * Get monthly statistics for a user's habits
 */
export async function getMonthlyHabitStats(
  userId: string,
  month: number,
  year: number
): Promise<{
  totalHabits: number;
  totalCompletions: number;
  completionRate: number;
  habitStats: Array<{
    habitId: string;
    habitTitle: string;
    scheduledDays: number;
    completedDays: number;
    completionRate: number;
  }>;
}> {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      completions: {
        where: {
          date: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
        },
      },
    },
  });

  const habitStats = habits.map((habit) => {
    // Count scheduled days in the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    let scheduledDays = 0;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      if (isHabitScheduledForDay(habit, d)) {
        scheduledDays++;
      }
    }

    const completedDays = habit.completions.length;
    const completionRate =
      scheduledDays > 0 ? (completedDays / scheduledDays) * 100 : 0;

    return {
      habitId: habit.id,
      habitTitle: habit.title,
      scheduledDays,
      completedDays,
      completionRate,
    };
  });

  const totalScheduledDays = habitStats.reduce(
    (sum, stat) => sum + stat.scheduledDays,
    0
  );
  const totalCompletions = habitStats.reduce(
    (sum, stat) => sum + stat.completedDays,
    0
  );
  const completionRate =
    totalScheduledDays > 0 ? (totalCompletions / totalScheduledDays) * 100 : 0;

  return {
    totalHabits: habits.length,
    totalCompletions,
    completionRate,
    habitStats,
  };
}

/**
 * Get next scheduled date for a habit
 */
export function getNextScheduledDate(habit: {
  frequency: string;
  daysOfWeek: string[];
}): Date | null {
  const today = normalizeDate(new Date());
  
  // Check next 14 days
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    
    if (isHabitScheduledForDay(habit, checkDate)) {
      return checkDate;
    }
  }
  
  return null;
}
