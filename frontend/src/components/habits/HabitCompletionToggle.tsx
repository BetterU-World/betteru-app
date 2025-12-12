"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

interface HabitCompletionToggleProps {
  habitId: string;
  isCompleted: boolean;
  onToggle: (habitId: string, completed: boolean) => Promise<void>;
}

export function HabitCompletionToggle({
  habitId,
  isCompleted,
  onToggle,
}: HabitCompletionToggleProps) {
  const [loading, setLoading] = useState(false);
  const [optimisticState, setOptimisticState] = useState(isCompleted);

  const handleToggle = async () => {
    setLoading(true);
    const newState = !optimisticState;
    setOptimisticState(newState);

    try {
      await onToggle(habitId, newState);
    } catch (error) {
      // Revert on error
      setOptimisticState(!newState);
      console.error("Error toggling habit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        w-8 h-8 rounded-full border-2 flex items-center justify-center
        transition-all duration-200 disabled:opacity-50
        ${
          optimisticState
            ? "bg-green-500 border-green-500 text-white hover:bg-green-600"
            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-green-500"
        }
      `}
      aria-label={optimisticState ? "Mark as incomplete" : "Mark as complete"}
    >
      {optimisticState ? (
        <Check className="w-5 h-5" />
      ) : (
        <div className="w-5 h-5" />
      )}
    </button>
  );
}
