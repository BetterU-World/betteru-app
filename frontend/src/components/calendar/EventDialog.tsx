"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarEvent } from "@/lib/calendar-utils";
import { formatDateForAPI } from "@/lib/calendar-utils";

interface UserCalendar {
  id: string;
  name: string;
  color: string;
  eventCount: number;
}

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => Promise<void>;
  onDelete?: () => Promise<void>;
  event?: CalendarEvent | null;
  selectedDate?: Date;
}

export default function EventDialog({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  selectedDate,
}: EventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userCalendarId, setUserCalendarId] = useState<string>("");
  const [userCalendars, setUserCalendars] = useState<UserCalendar[]>([]);

  // Fetch user calendars
  useEffect(() => {
    if (isOpen) {
      fetchUserCalendars();
    }
  }, [isOpen]);

  const fetchUserCalendars = async () => {
    try {
      const res = await fetch("/api/user-calendars");
      if (res.ok) {
        const data = await res.json();
        setUserCalendars(data);
      }
    } catch (error) {
      console.error("Error fetching user calendars:", error);
    }
  };

  // Initialize form with event data or selected date
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setDate(formatDateForAPI(new Date(event.date)));
      setUserCalendarId((event as any).userCalendarId || "");
      
      if (event.startTime) {
        const startDate = new Date(event.startTime);
        setStartTime(`${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`);
      }
      
      if (event.endTime) {
        const endDate = new Date(event.endTime);
        setEndTime(`${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`);
      }
      
      setAllDay(event.allDay);
    } else if (selectedDate) {
      setDate(formatDateForAPI(selectedDate));
      setUserCalendarId("");
    } else {
      setDate(formatDateForAPI(new Date()));
      setUserCalendarId("");
    }
  }, [event, selectedDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData: any = {
        title,
        description: description || null,
        date: new Date(date),
        allDay,
        userCalendarId: userCalendarId || null,
      };

      // Add times if not all-day
      if (!allDay && startTime) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const startDateTime = new Date(date);
        startDateTime.setHours(hours, minutes, 0, 0);
        eventData.startTime = startDateTime;
      }

      if (!allDay && endTime) {
        const [hours, minutes] = endTime.split(":").map(Number);
        const endDateTime = new Date(date);
        endDateTime.setHours(hours, minutes, 0, 0);
        eventData.endTime = endDateTime;
      }

      await onSave(eventData);
      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (confirm("Are you sure you want to delete this event?")) {
      setLoading(true);
      try {
        await onDelete();
        handleClose();
      } catch (error) {
        console.error("Error deleting event:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setAllDay(false);
    setUserCalendarId("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendar">Calendar</Label>
              <select
                id="calendar"
                value={userCalendarId}
                onChange={(e) => setUserCalendarId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">No Calendar</option>
                {userCalendars.map((cal) => (
                  <option key={cal.id} value={cal.id}>
                    {cal.name}
                  </option>
                ))}
              </select>
              {userCalendarId && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: userCalendars.find((c) => c.id === userCalendarId)?.color,
                    }}
                  />
                  <span>{userCalendars.find((c) => c.id === userCalendarId)?.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="allDay"
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(checked as boolean)}
              />
              <Label htmlFor="allDay" className="text-sm cursor-pointer">
                All day event
              </Label>
            </div>

            {!allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {event && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : event ? "Update" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
