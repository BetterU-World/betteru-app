"use client";

import React, { useState } from "react";

interface Calendar {
  id: string;
  name: string;
  color: string;
  _count: {
    events: number;
  };
}

interface EditCalendarModalProps {
  calendar: Calendar;
  onClose: () => void;
  onSave: (id: string, name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const EditCalendarModal: React.FC<EditCalendarModalProps> = ({
  calendar,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState(calendar.name);
  const [color, setColor] = useState(calendar.color);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(calendar.id, name, color);
      onClose();
    } catch (error) {
      console.error("Failed to save calendar:", error);
      alert("Failed to save calendar. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${calendar.name}"? This will also delete all ${calendar._count.events} event(s) in this calendar.`
    );

    if (!confirmed || isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete(calendar.id);
      onClose();
    } catch (error) {
      console.error("Failed to delete calendar:", error);
      alert("Failed to delete calendar. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Edit Calendar</h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calendar Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isSaving || isDeleting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                disabled={isSaving || isDeleting}
              />
              <div
                className="w-10 h-10 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-600">{color}</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Deleting..." : "Delete Calendar"}
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isDeleting || !name.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCalendarModal;
