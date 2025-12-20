/**
 * Goal Query Helpers
 * 
 * Helper functions for fetching and aggregating goal data
 * Used for dashboard summaries and statistics
 */

import prisma from "@/lib/prisma";
import { getHabitStreak } from "@/lib/habits/streaks";
import { calculateGoalProgress, getNextMilestone } from "./progress";
import type { GoalStatus, GoalPriority } from "@prisma/client";

/**
 * Get summary statistics for active goals
 * Used for dashboard widgets and overview displays
 * 
 * @param userId - User ID
 * @returns Active goals summary
 */
export async function getActiveGoalsSummary(userId: string) {
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      status: {
        in: ["NOT_STARTED", "IN_PROGRESS"],
      },
    },
    include: {
      Milestone: true,
      GoalStep: true,
    },
    orderBy: [
      { priority: "desc" },
      { targetDate: "asc" },
    ],
  });

  const completedGoals = await prisma.goal.count({
    where: {
      userId,
      status: "COMPLETED",
    },
  });

  // Find next upcoming milestone across all goals
  let nextUpcomingMilestone: {
    milestone: any;
    goal: any;
  } | null = null;

  for (const goal of goals) {
    const nextMilestone = getNextMilestone(goal);
    if (nextMilestone && nextMilestone.dueDate) {
      if (
        !nextUpcomingMilestone ||
        (nextMilestone.dueDate && nextUpcomingMilestone.milestone.dueDate &&
          nextMilestone.dueDate < nextUpcomingMilestone.milestone.dueDate)
      ) {
        nextUpcomingMilestone = {
          milestone: nextMilestone,
          goal: {
            id: goal.id,
            title: goal.title,
          },
        };
      }
    }
  }

  // Get top 3 priority active goals
  const topPriorityGoals = goals
    .slice(0, 3)
    .map(goal => ({
      id: goal.id,
      title: goal.title,
      category: goal.category,
      priority: goal.priority,
      progress: calculateGoalProgress(goal),
      targetDate: goal.targetDate,
    }));

  // Compute Top Habit Streaks (up to 3)
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      completions: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const habitStreaks = await Promise.all(
    habits.map(async (h) => {
      const currentStreakDays = await getHabitStreak(h.id);
      const lastCompletedDate = h.completions?.[0]?.date ?? null;
      return {
        habitId: h.id,
        title: h.title,
        currentStreakDays,
        bestStreakDays: currentStreakDays,
        lastCompletedDate,
      };
    })
  );

  const topHabitStreaks = habitStreaks
    .filter((h) => h.currentStreakDays > 0)
    .sort((a, b) => b.currentStreakDays - a.currentStreakDays)
    .slice(0, 3);

  return {
    countActiveGoals: goals.length,
    countCompletedGoals: completedGoals,
    nextUpcomingMilestone,
    topPriorityGoals,
    topHabitStreaks,
  };
}

/**
 * Get goals with milestones due in a specific date range
 * Used for calendar integration
 * 
 * @param userId - User ID
 * @param startDate - Range start date
 * @param endDate - Range end date
 * @returns Goals with milestones in range
 */
export async function getGoalsWithMilestonesInRange(
  userId: string,
  startDate: Date,
  endDate: Date
) {
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      Milestone: {
        some: {
          dueDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    },
    include: {
      Milestone: {
        where: {
          dueDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      },
    },
  });

  return goals;
}

/**
 * Get goals by status with optional filtering
 * 
 * @param userId - User ID
 * @param filters - Optional filters (status, category, priority)
 * @returns Filtered goals with progress data
 */
export async function getFilteredGoals(
  userId: string,
  filters?: {
    status?: GoalStatus | GoalStatus[];
    category?: string;
    priority?: GoalPriority;
  }
) {
  const whereClause: any = { userId };

  if (filters?.status) {
    whereClause.status = Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status;
  }

  if (filters?.category) {
    whereClause.category = filters.category;
  }

  if (filters?.priority) {
    whereClause.priority = filters.priority;
  }

  const goals = await prisma.goal.findMany({
    where: whereClause,
    include: {
      Milestone: {
        orderBy: [
          { completed: "asc" },
          { dueDate: "asc" },
          { order: "asc" },
        ],
      },
      GoalStep: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { priority: "desc" },
      { targetDate: "asc" },
    ],
  });

  return goals.map(goal => ({
    ...goal,
    progress: calculateGoalProgress(goal),
  }));
}

/**
 * Get all unique categories from user's goals
 * 
 * @param userId - User ID
 * @returns Array of unique category names
 */
export async function getGoalCategories(userId: string): Promise<string[]> {
  const goals = await prisma.goal.findMany({
    where: { userId },
    select: { category: true },
    distinct: ["category"],
  });

  return goals
    .map(g => g.category)
    .filter(Boolean)
    .sort();
}
