"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { HabitList } from "@/components/habits/HabitList";
import { HabitForm, HabitFormData } from "@/components/habits/HabitForm";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface Habit {
  id: string;
  title: string;
  description?: string | null;
  frequency: string;
  daysOfWeek: string[];
  streak: number;
  isCompletedToday: boolean;
}

export default function HabitsClient() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [focusHabitId, setFocusHabitId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchHabits();
  }, []);

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (focus) {
      setFocusHabitId(focus);
      // Scroll into view after a short delay to ensure render
      setTimeout(() => {
        const el = document.getElementById(focus);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          // Remove highlight after a few seconds
          setTimeout(() => setFocusHabitId(null), 3000);
        }
      }, 300);
    }
  }, [searchParams]);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/habits");
      const data = await res.json();

      if (res.ok) {
        setHabits(data.habits || []);
      }
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = () => {
    setEditingHabit(null);
    setShowForm(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleSaveHabit = async (habitData: HabitFormData) => {
    try {
      if (editingHabit) {
        // Update existing habit
        const res = await fetch(`/api/habits/${editingHabit.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(habitData),
        });

        if (res.ok) {
          await fetchHabits();
        }
      } else {
        // Create new habit
        const res = await fetch("/api/habits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(habitData),
        });

        if (res.ok) {
          await fetchHabits();
        }
      }
    } catch (error) {
      console.error("Error saving habit:", error);
      throw error;
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm("Are you sure you want to delete this habit?")) {
      return;
    }

    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchHabits();
      }
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  const handleToggleCompletion = async (habitId: string, completed: boolean) => {
    try {
      const endpoint = completed ? "complete" : "uncomplete";
      const res = await fetch(`/api/habits/${habitId}/${endpoint}`, {
        method: "POST",
      });

      if (res.ok) {
        // Update local state optimistically
        setHabits((prevHabits) =>
          prevHabits.map((h) =>
            h.id === habitId
              ? { ...h, isCompletedToday: completed, streak: completed ? h.streak + 1 : Math.max(0, h.streak - 1) }
              : h
          )
        );
        // Refresh to get accurate streak
        await fetchHabits();
      }
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      throw error;
    }
  };

  const handleGenerateSuggestions = async () => {
    try {
      await fetch("/api/calendar-suggestions/generate", {
        method: "POST",
      });
      alert("Habit suggestions generated! Check the Calendar page.");
    } catch (error) {
      console.error("Error generating suggestions:", error);
      alert("Failed to generate suggestions");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Habits</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Build better routines and track your progress
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateSuggestions}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Suggestions
            </Button>
            <Button onClick={handleCreateHabit} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Habit
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-500">Loading habits...</p>
          </div>
        ) : (
          <HabitList
            habits={habits}
            onToggleCompletion={handleToggleCompletion}
            onEdit={handleEditHabit}
            onDelete={handleDeleteHabit}
            focusHabitId={focusHabitId ?? undefined}
          />
        )}
      </main>

      <HabitForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        habit={editingHabit}
      />
    </div>
  );
}
