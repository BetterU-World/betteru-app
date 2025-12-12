"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: HabitFormData) => Promise<void>;
  habit?: {
    id: string;
    title: string;
    description?: string | null;
    frequency: string;
    daysOfWeek: string[];
  } | null;
}

export interface HabitFormData {
  title: string;
  description: string;
  frequency: string;
  daysOfWeek: string[];
}

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export function HabitForm({ isOpen, onClose, onSave, habit }: HabitFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">("daily");
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || "");
      setFrequency(habit.frequency as "daily" | "weekly" | "custom");
      setSelectedDays(new Set(habit.daysOfWeek.map((d) => d.toLowerCase())));
    } else {
      setTitle("");
      setDescription("");
      setFrequency("daily");
      setSelectedDays(new Set());
    }
    setError("");
  }, [habit, isOpen]);

  const handleDayToggle = (day: string) => {
    const newDays = new Set(selectedDays);
    if (newDays.has(day)) {
      newDays.delete(day);
    } else {
      newDays.add(day);
    }
    setSelectedDays(newDays);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if ((frequency === "weekly" || frequency === "custom") && selectedDays.size === 0) {
      setError("Please select at least one day");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        frequency,
        daysOfWeek: Array.from(selectedDays),
      });
      onClose();
    } catch (err) {
      setError("Failed to save habit. Please try again.");
      console.error("Error saving habit:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit Habit" : "Create New Habit"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Exercise"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your habit..."
              rows={3}
            />
          </div>

          <div>
            <Label>Frequency *</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={frequency === "daily" ? "default" : "outline"}
                onClick={() => setFrequency("daily")}
                className="flex-1"
              >
                Daily
              </Button>
              <Button
                type="button"
                variant={frequency === "weekly" ? "default" : "outline"}
                onClick={() => setFrequency("weekly")}
                className="flex-1"
              >
                Weekly
              </Button>
              <Button
                type="button"
                variant={frequency === "custom" ? "default" : "outline"}
                onClick={() => setFrequency("custom")}
                className="flex-1"
              >
                Custom
              </Button>
            </div>
          </div>

          {(frequency === "weekly" || frequency === "custom") && (
            <div>
              <Label>Select Days *</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Checkbox
                      id={day}
                      checked={selectedDays.has(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label
                      htmlFor={day}
                      className="capitalize cursor-pointer flex-1"
                    >
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : habit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
