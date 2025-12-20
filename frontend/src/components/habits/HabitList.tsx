"use client";

import { HabitCompletionToggle } from "./HabitCompletionToggle";
import { Flame, Edit, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Habit {
  id: string;
  title: string;
  description?: string | null;
  frequency: string;
  daysOfWeek: string[];
  streak: number;
  isCompletedToday: boolean;
}

interface HabitListProps {
  habits: Habit[];
  onToggleCompletion: (habitId: string, completed: boolean) => Promise<void>;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => Promise<void>;
  focusHabitId?: string;
}

export function HabitList({
  habits,
  onToggleCompletion,
  onEdit,
  onDelete,
  focusHabitId,
}: HabitListProps) {
  const getFrequencyDisplay = (habit: Habit) => {
    if (habit.frequency === "daily") {
      return "Every day";
    }
    if (habit.frequency === "weekly" || habit.frequency === "custom") {
      const days = habit.daysOfWeek.map((d) => d.slice(0, 3).toUpperCase());
      return days.join(", ");
    }
    return habit.frequency;
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">No habits yet</p>
        <p className="text-sm">Create your first habit to start building better routines</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <div
          key={habit.id}
          id={habit.id}
          className={`bg-white dark:bg-gray-800 border rounded-lg p-4 hover:shadow-md transition-shadow ${
            habit.id === focusHabitId
              ? "border-indigo-400 ring-2 ring-indigo-200"
              : "border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="pt-1">
              <HabitCompletionToggle
                habitId={habit.id}
                isCompleted={habit.isCompletedToday}
                onToggle={onToggleCompletion}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{habit.title}</h3>
                {habit.streak > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
                    <Flame className="w-3 h-3" />
                    <span>{habit.streak}</span>
                  </div>
                )}
              </div>

              {habit.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {habit.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {getFrequencyDisplay(habit)}
                </span>
                {habit.streak > 0 && (
                  <span>{habit.streak} day{habit.streak !== 1 ? "s" : ""} streak</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(habit)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(habit.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
