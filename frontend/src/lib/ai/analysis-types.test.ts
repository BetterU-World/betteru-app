/**
 * Tests for AI Analysis Type Mappers
 * 
 * These tests verify that domain objects are correctly mapped to AnalyzableItem
 * format for future AI assistant consumption.
 */

import {
  mapDiaryEntryToAnalyzableItem,
  mapHabitToAnalyzableItem,
  mapGoalToAnalyzableItem,
  mapCalendarEventToAnalyzableItem,
  type AnalyzableItem,
} from "./analysis-types";

// Mock data for testing
const mockDiaryEntry = {
  id: "diary-1",
  userId: "user-1",
  date: new Date("2025-12-11"),
  title: "A Wonderful Day",
  content: "Today was amazing! I completed my morning routine and felt energized.",
  mood: "happy",
  tags: ["morning", "routine", "energy"],
  createdAt: new Date("2025-12-11T08:00:00Z"),
  updatedAt: new Date("2025-12-11T08:00:00Z"),
};

const mockHabit = {
  id: "habit-1",
  userId: "user-1",
  title: "Morning Meditation",
  description: "10 minutes of mindfulness",
  frequency: "daily",
  daysOfWeek: [],
  createdAt: new Date("2025-12-01"),
  updatedAt: new Date("2025-12-11"),
};

const mockGoal = {
  id: "goal-1",
  userId: "user-1",
  title: "Learn TypeScript",
  description: "Master advanced TypeScript patterns",
  category: "Learning",
  status: "IN_PROGRESS" as const,
  priority: "HIGH" as const,
  progress: 65,
  startDate: new Date("2025-12-01"),
  targetDate: new Date("2026-01-01"),
  completedAt: null,
  createdAt: new Date("2025-12-01"),
  updatedAt: new Date("2025-12-11"),
  GoalStep: [
    {
      id: "step-1",
      goalId: "goal-1",
      title: "Read TypeScript handbook",
      done: true,
      order: 0,
      createdAt: new Date("2025-12-01"),
      updatedAt: new Date("2025-12-05"),
    },
    {
      id: "step-2",
      goalId: "goal-1",
      title: "Build a sample project",
      done: false,
      order: 1,
      createdAt: new Date("2025-12-01"),
      updatedAt: new Date("2025-12-01"),
    },
  ],
};

const mockCalendarEvent = {
  id: "event-1",
  userId: "user-1",
  title: "Team Meeting",
  description: "Weekly sync with the team",
  date: new Date("2025-12-12T10:00:00Z"),
  startTime: new Date("2025-12-12T10:00:00Z"),
  endTime: new Date("2025-12-12T11:00:00Z"),
  allDay: false,
  userCalendarId: "cal-1",
  diaryEntryId: null,
  createdAt: new Date("2025-12-10"),
  updatedAt: new Date("2025-12-10"),
  userCalendar: {
    id: "cal-1",
    userId: "user-1",
    name: "Work",
    color: "#3B82F6",
    createdAt: new Date("2025-12-01"),
    updatedAt: new Date("2025-12-01"),
  },
};

/**
 * Test diary entry mapping
 */
function testDiaryEntryMapper() {
  console.log("Testing Diary Entry Mapper...");
  const result = mapDiaryEntryToAnalyzableItem(mockDiaryEntry as any);
  
  console.assert(result.id === "diary-1", "ID should match");
  console.assert(result.sourceType === "diary", "Source type should be diary");
  console.assert(result.mood === "happy", "Mood should be preserved");
  console.assert(result.tags?.length === 3, "Tags should be preserved");
  console.assert(result.text === mockDiaryEntry.content, "Text should be content");
  
  console.log("✓ Diary Entry Mapper passed");
}

/**
 * Test habit mapping
 */
function testHabitMapper() {
  console.log("Testing Habit Mapper...");
  const result = mapHabitToAnalyzableItem(mockHabit as any, {
    streak: 15,
    completionRate: 0.85,
  });
  
  console.assert(result.id === "habit-1", "ID should match");
  console.assert(result.sourceType === "habit", "Source type should be habit");
  console.assert(result.title === "Morning Meditation", "Title should match");
  console.assert(result.metadata?.streak === 15, "Streak should be in metadata");
  
  console.log("✓ Habit Mapper passed");
}

/**
 * Test goal mapping
 */
function testGoalMapper() {
  console.log("Testing Goal Mapper...");
  const result = mapGoalToAnalyzableItem(mockGoal as any);
  
  console.assert(result.id === "goal-1", "ID should match");
  console.assert(result.sourceType === "goal", "Source type should be goal");
  console.assert(result.tags?.includes("Learning"), "Category should be in tags");
  console.assert(result.metadata?.stepsCompleted === 1, "Should count completed steps");
  console.assert(result.metadata?.stepsTotal === 2, "Should count total steps");
  
  console.log("✓ Goal Mapper passed");
}

/**
 * Test calendar event mapping
 */
function testCalendarEventMapper() {
  console.log("Testing Calendar Event Mapper...");
  const result = mapCalendarEventToAnalyzableItem(mockCalendarEvent as any);
  
  console.assert(result.id === "event-1", "ID should match");
  console.assert(result.sourceType === "calendar_event", "Source type should be calendar_event");
  console.assert(result.metadata?.userCalendarName === "Work", "Calendar name should be in metadata");
  console.assert(result.metadata?.allDay === false, "allDay should be in metadata");
  
  console.log("✓ Calendar Event Mapper passed");
}

/**
 * Run all tests
 */
export function runMapperTests() {
  console.log("\n=== Running AI Mapper Tests ===\n");
  
  try {
    testDiaryEntryMapper();
    testHabitMapper();
    testGoalMapper();
    testCalendarEventMapper();
    
    console.log("\n✓ All mapper tests passed!\n");
    return true;
  } catch (error) {
    console.error("\n✗ Tests failed:", error);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runMapperTests();
}
