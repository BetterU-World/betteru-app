/**
 * Goal Progress Calculation Utilities
 * 
 * Functions for calculating goal progress based on milestones
 * and deriving goal status from progress percentage.
 */

import type { Goal, GoalMilestone, GoalStatus } from "@prisma/client";

export type GoalWithMilestones = Goal & {
  Milestone?: GoalMilestone[];
  GoalStep?: Array<{ done: boolean }>;
};

/**
 * Calculate goal progress percentage based on completed milestones
 * 
 * @param goal - Goal with milestones array
 * @returns Progress percentage (0-100)
 */
export function calculateGoalProgress(goal: GoalWithMilestones): number {
  // Priority 1: Use new Milestone system if available
  if (goal.Milestone && goal.Milestone.length > 0) {
    const totalMilestones = goal.Milestone.length;
    const completedMilestones = goal.Milestone.filter(m => m.completed).length;
    return Math.round((completedMilestones / totalMilestones) * 100);
  }
  
  // Priority 2: Fall back to old GoalStep system (backward compatibility)
  if (goal.GoalStep && goal.GoalStep.length > 0) {
    const totalSteps = goal.GoalStep.length;
    const completedSteps = goal.GoalStep.filter(s => s.done).length;
    return Math.round((completedSteps / totalSteps) * 100);
  }
  
  // Priority 3: Use stored progress field
  return goal.progress || 0;
}

/**
 * Derive goal status from progress percentage
 * 
 * @param progress - Progress percentage (0-100)
 * @param currentStatus - Current goal status (to preserve ON_HOLD)
 * @returns Suggested goal status
 */
export function deriveGoalStatusFromProgress(
  progress: number,
  currentStatus: GoalStatus
): GoalStatus {
  // Never auto-change from ON_HOLD
  if (currentStatus === "ON_HOLD") {
    return currentStatus;
  }
  
  // Never auto-change from ARCHIVED
  if (currentStatus === "ARCHIVED") {
    return currentStatus;
  }
  
  // Auto-complete when progress reaches 100%
  if (progress >= 100) {
    return "COMPLETED";
  }
  
  // Set to in progress if making progress
  if (progress > 0 && progress < 100) {
    return "IN_PROGRESS";
  }
  
  // Default to not started
  return "NOT_STARTED";
}

/**
 * Get completion statistics for a goal
 * 
 * @param goal - Goal with milestones
 * @returns Object with milestone counts and progress
 */
export function getGoalCompletionStats(goal: GoalWithMilestones) {
  const milestones = goal.Milestone || [];
  const steps = goal.GoalStep || [];
  
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.done).length;
  
  const progress = calculateGoalProgress(goal);
  
  return {
    milestones: {
      total: totalMilestones,
      completed: completedMilestones,
      remaining: totalMilestones - completedMilestones,
    },
    steps: {
      total: totalSteps,
      completed: completedSteps,
      remaining: totalSteps - completedSteps,
    },
    progress,
    isComplete: progress >= 100,
  };
}

/**
 * Get the next upcoming milestone for a goal
 * 
 * @param goal - Goal with milestones
 * @returns Next milestone or null
 */
export function getNextMilestone(goal: GoalWithMilestones): GoalMilestone | null {
  if (!goal.Milestone || goal.Milestone.length === 0) {
    return null;
  }
  
  const now = new Date();
  
  // Find incomplete milestones with due dates
  const upcomingMilestones = goal.Milestone
    .filter(m => !m.completed && m.dueDate)
    .sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  
  // Return the earliest upcoming milestone
  if (upcomingMilestones.length > 0) {
    return upcomingMilestones[0];
  }
  
  // If no milestones with dates, return first incomplete milestone by order
  const incompleteMilestones = goal.Milestone
    .filter(m => !m.completed)
    .sort((a, b) => a.order - b.order);
  
  return incompleteMilestones[0] || null;
}

/**
 * Check if a goal is overdue
 * 
 * @param goal - Goal object
 * @returns True if the goal has passed its target date and is not completed
 */
export function isGoalOverdue(goal: Goal): boolean {
  if (!goal.targetDate) return false;
  if (goal.status === "COMPLETED") return false;
  
  const now = new Date();
  return goal.targetDate < now;
}

/**
 * Get days until goal target date
 * 
 * @param goal - Goal object
 * @returns Number of days (negative if overdue, null if no target date)
 */
export function getDaysUntilTarget(goal: Goal): number | null {
  if (!goal.targetDate) return null;
  
  const now = new Date();
  const diffMs = goal.targetDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
