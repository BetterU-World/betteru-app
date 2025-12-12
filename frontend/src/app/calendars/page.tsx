"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";

interface UserCalendar {
  id: string;
  name: string;
  color: string;
  type: "SYSTEM" | "CUSTOM";
  slug: string | null;
  isVisible: boolean;
  eventCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<UserCalendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<UserCalendar | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#6366F1");

  const defaultColors = [
    "#6366F1", // indigo
    "#EC4899", // pink
    "#10B981", // green
    "#F59E0B", // amber
    "#8B5CF6", // purple
    "#3B82F6", // blue
    "#EF4444", // red
    "#14B8A6", // teal
    "#F97316", // orange
    "#06B6D4", // cyan
  ];

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user-calendars");
      if (res.ok) {
        const data = await res.json();
        setCalendars(data);
      }
    } catch (error) {
      console.error("Error fetching calendars:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCalendar = () => {
    setEditingCalendar(null);
    setName("");
    setColor(defaultColors[Math.floor(Math.random() * defaultColors.length)]);
    setShowDialog(true);
  };

  const handleEditCalendar = (calendar: UserCalendar) => {
    setEditingCalendar(calendar);
    setName(calendar.name);
    setColor(calendar.color);
    setShowDialog(true);
  };

  const handleSaveCalendar = async () => {
    if (!name.trim()) {
      alert("Please enter a calendar name");
      return;
    }

    try {
      setLoading(true);
      
      if (editingCalendar) {
        // Update existing calendar
        const res = await fetch(`/api/user-calendars/${editingCalendar.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), color }),
        });

        if (res.ok) {
          await fetchCalendars();
          setShowDialog(false);
        } else {
          const data = await res.json();
          alert(data.error || "Failed to update calendar");
        }
      } else {
        // Create new calendar
        const res = await fetch("/api/user-calendars", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), color }),
        });

        if (res.ok) {
          await fetchCalendars();
          setShowDialog(false);
        } else {
          const data = await res.json();
          alert(data.error || "Failed to create calendar");
        }
      }
    } catch (error) {
      console.error("Error saving calendar:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCalendar = async (calendar: UserCalendar) => {
    if (!confirm(`Are you sure you want to delete "${calendar.name}"? Events in this calendar will be moved to "No Calendar".`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/user-calendars/${calendar.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCalendars();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete calendar");
      }
    } catch (error) {
      console.error("Error deleting calendar:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              My Calendars
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage your calendars to organize events
            </p>
          </div>
          <Button onClick={handleAddCalendar} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            New Calendar
          </Button>
        </div>

        {/* Calendars list */}
        {loading && calendars.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : calendars.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No calendars yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first calendar to start organizing your events
            </p>
            <Button onClick={handleAddCalendar}>
              <Plus className="w-4 h-4 mr-2" />
              Create Calendar
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {calendars.map((calendar) => (
              <div
                key={calendar.id}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: calendar.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{calendar.name}</h3>
                        {calendar.type === "SYSTEM" && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {calendar.eventCount} {calendar.eventCount === 1 ? "event" : "events"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCalendar(calendar)}
                      disabled={loading}
                      title={calendar.type === "SYSTEM" ? "Edit color only" : "Edit calendar"}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {calendar.type === "CUSTOM" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCalendar(calendar)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to calendar link */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => window.location.href = "/calendar"}
          >
            ← Back to Calendar
          </Button>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCalendar 
                ? (editingCalendar.type === "SYSTEM" ? "Edit Calendar Color" : "Edit Calendar")
                : "Create Calendar"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {(!editingCalendar || editingCalendar.type === "CUSTOM") && (
              <div className="space-y-2">
                <Label htmlFor="name">Calendar Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Work, Personal, Family"
                  autoFocus
                />
              </div>
            )}
            {editingCalendar?.type === "SYSTEM" && (
              <div className="space-y-2">
                <Label>Calendar Name</Label>
                <Input
                  value={name}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500">System calendars cannot be renamed</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {defaultColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-full h-12 rounded-lg transition-all ${
                      color === c ? "ring-2 ring-offset-2 ring-blue-500 scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="customColor" className="text-sm">Custom:</Label>
                <input
                  id="customColor"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-8 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{color}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveCalendar} disabled={loading}>
              {loading ? "Saving..." : editingCalendar ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
