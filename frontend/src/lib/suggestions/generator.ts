import prisma from "@/lib/prisma";
import { GoalStatus } from "@prisma/client";

export interface SuggestionInput {
  title: string;
  description?: string;
  suggestedDate: Date;
  sourceType: "goal" | "habit" | "system";
  sourceId?: string;
}

/**
 * Generate calendar suggestions from active goals with milestones
 */
export async function generateGoalSuggestions(
  userId: string
): Promise<SuggestionInput[]> {
  const suggestions: SuggestionInput[] = [];

  // Get all active goals with milestones
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      status: {
        in: [GoalStatus.NOT_STARTED, GoalStatus.IN_PROGRESS],
      },
    },
    include: {
      GoalStep: true,
      Milestone: true,
    },
  });

  const now = new Date();

  for (const goal of goals) {
    // PRIORITY 1: Generate suggestions for milestones with due dates
    if (goal.Milestone && goal.Milestone.length > 0) {
      for (const milestone of goal.Milestone) {
        if (milestone.completed || !milestone.dueDate) continue;

        const dueDate = new Date(milestone.dueDate);
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Only suggest if due date is in the future and within 30 days
        if (daysUntilDue > 0 && daysUntilDue <= 30) {
          // Create suggestions 3, 5, and 7 days before due date
          const reminderOffsets = [3, 5, 7].filter(days => days < daysUntilDue);
          
          for (const offset of reminderOffsets) {
            const suggestionDate = new Date(dueDate);
            suggestionDate.setDate(suggestionDate.getDate() - offset);
            suggestionDate.setHours(9, 0, 0, 0);

            if (suggestionDate > now) {
              suggestions.push({
                title: `🎯 ${goal.title}`,
                description: `Milestone due in ${offset} days: ${milestone.title}`,
                suggestedDate: suggestionDate,
                sourceType: "goal",
                sourceId: goal.id,
              });
            }
          }
        }
      }
    }

    // PRIORITY 2: For goals with target dates (but no milestones or in addition to milestones)
    if (goal.targetDate) {
      const targetDate = new Date(goal.targetDate);
      const daysUntilTarget = Math.floor(
        (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Only suggest if target is in the future and within 90 days
      if (daysUntilTarget > 0 && daysUntilTarget <= 90) {
        // Suggest reminder 5 days before (or 2 days before if less than 7 days away)
        const reminderDays = daysUntilTarget < 7 ? 2 : 5;
        const suggestionDate = new Date(targetDate);
        suggestionDate.setDate(suggestionDate.getDate() - reminderDays);
        suggestionDate.setHours(9, 0, 0, 0);

        // Only suggest if the reminder date is in the future
        if (suggestionDate > now) {
          suggestions.push({
            title: `🎯 Goal Deadline: ${goal.title}`,
            description: `Your goal "${goal.title}" is due in ${daysUntilTarget} days. Consider reviewing your progress and planning next steps.`,
            suggestedDate: suggestionDate,
            sourceType: "goal",
            sourceId: goal.id,
          });
        }
      }
    }

    // PRIORITY 3: For goals with incomplete steps (backward compatibility)
    const incompleteSteps = goal.GoalStep.filter((step) => !step.done).sort(
      (a, b) => a.order - b.order
    );

    if (incompleteSteps.length > 0 && !goal.Milestone?.length) {
      const nextStep = incompleteSteps[0];
      // Suggest working on the next step tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM

      suggestions.push({
        title: `📋 Next Step: ${nextStep.title}`,
        description: `Continue working on "${goal.title}" by completing: ${nextStep.title}`,
        suggestedDate: tomorrow,
        sourceType: "goal",
        sourceId: goal.id,
      });
    }
  }

  return suggestions;
}

/**
 * Generate calendar suggestions from recurring habits
 */
export async function generateHabitSuggestions(
  userId: string
): Promise<SuggestionInput[]> {
  const suggestions: SuggestionInput[] = [];

  // Get all habits for the user
  const habits = await prisma.habit.findMany({
    where: { userId },
  });

  const now = new Date();
  const lookAheadDays = 14;

  for (const habit of habits) {
    // Look ahead 14 days
    for (let dayOffset = 0; dayOffset < lookAheadDays; dayOffset++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + dayOffset);
      checkDate.setHours(9, 0, 0, 0); // Set to 9 AM

      // Check if habit is scheduled for this day
      const isScheduled = isHabitScheduledForDay(habit, checkDate);

      if (isScheduled) {
        const dayName = checkDate.toLocaleDateString("en-US", {
          weekday: "long",
        });

        suggestions.push({
          title: `${habit.title}`,
          description: `${dayName} - ${
            habit.description || "Complete your habit today"
          }`,
          suggestedDate: checkDate,
          sourceType: "habit",
          sourceId: habit.id,
        });
      }
    }
  }

  return suggestions;
}

/**
 * Helper function to check if a habit is scheduled for a specific day
 */
function isHabitScheduledForDay(
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
 * Generate calendar suggestions from diary entries with actionable content
 */
export async function generateDiarySuggestions(
  userId: string
): Promise<SuggestionInput[]> {
  const suggestions: SuggestionInput[] = [];

  // Get recent diary entries (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entries = await prisma.diaryEntry.findMany({
    where: {
      userId,
      date: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const actionKeywords = [
    "remind me",
    "need to",
    "should",
    "must",
    "todo",
    "to do",
    "follow up",
    "schedule",
    "plan to",
  ];

  for (const entry of entries) {
    const contentLower = entry.content.toLowerCase();
    const titleLower = entry.title?.toLowerCase() || "";

    // Check if entry contains action keywords
    const hasActionKeyword = actionKeywords.some(
      (keyword) => contentLower.includes(keyword) || titleLower.includes(keyword)
    );

    if (hasActionKeyword) {
      // Suggest a follow-up 2-3 days after the entry
      const suggestionDate = new Date(entry.date);
      suggestionDate.setDate(suggestionDate.getDate() + 2);

      // Only suggest if date is in the future
      if (suggestionDate > new Date()) {
        suggestions.push({
          title: `📝 Follow up: ${entry.title}`,
          description: `Review your diary entry and take action on: ${entry.title}`,
          suggestedDate: suggestionDate,
          sourceType: "system",
          sourceId: entry.id,
        });
      }
    }
  }

  return suggestions;
}

/**
 * Save suggestions to database, avoiding duplicates and dismissed items
 */
export async function saveSuggestions(
  userId: string,
  suggestions: SuggestionInput[]
): Promise<number> {
  let savedCount = 0;

  for (const suggestion of suggestions) {
    // Check if suggestion already exists (not dismissed, same source, similar date)
    const existingSuggestion = await prisma.calendarSuggestion.findFirst({
      where: {
        userId,
        sourceType: suggestion.sourceType,
        sourceId: suggestion.sourceId,
        dismissed: false,
        // Check if suggestion is within same day
        suggestedDate: {
          gte: new Date(
            suggestion.suggestedDate.getFullYear(),
            suggestion.suggestedDate.getMonth(),
            suggestion.suggestedDate.getDate()
          ),
          lt: new Date(
            suggestion.suggestedDate.getFullYear(),
            suggestion.suggestedDate.getMonth(),
            suggestion.suggestedDate.getDate() + 1
          ),
        },
      },
    });

    // Only create if doesn't exist
    if (!existingSuggestion) {
      await prisma.calendarSuggestion.create({
        data: {
          userId,
          title: suggestion.title,
          description: suggestion.description,
          suggestedDate: suggestion.suggestedDate,
          sourceType: suggestion.sourceType,
          sourceId: suggestion.sourceId,
          dismissed: false,
        },
      });
      savedCount++;
    }
  }

  return savedCount;
}

/**
 * Fetch all non-dismissed suggestions for a user
 */
export async function fetchSuggestionsForUser(
  userId: string,
  dateRange?: { from: Date; to: Date }
) {
  const where: any = {
    userId,
    dismissed: false,
  };

  if (dateRange) {
    where.suggestedDate = {
      gte: dateRange.from,
      lte: dateRange.to,
    };
  }

  return await prisma.calendarSuggestion.findMany({
    where,
    orderBy: {
      suggestedDate: "asc",
    },
  });
}

/**
 * Generate and save all suggestions for a user
 */
export async function generateAndSaveAllSuggestions(
  userId: string
): Promise<{ total: number; saved: number }> {
  const goalSuggestions = await generateGoalSuggestions(userId);
  const habitSuggestions = await generateHabitSuggestions(userId);
  const diarySuggestions = await generateDiarySuggestions(userId);

  const allSuggestions = [
    ...goalSuggestions,
    ...habitSuggestions,
    ...diarySuggestions,
  ];

  const savedCount = await saveSuggestions(userId, allSuggestions);

  return {
    total: allSuggestions.length,
    saved: savedCount,
  };
}
