"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";

interface ListItem {
  id: string;
  content: string;
  done: boolean;
  order: number;
  dueDate: string | null;
}

interface List {
  id: string;
  name: string;
  description: string | null;
  color: string;
  items: ListItem[];
}

export default function ListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states for new list
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [formListName, setFormListName] = useState("");
  const [formListDescription, setFormListDescription] = useState("");
  const [formListColor, setFormListColor] = useState("#10b981");
  const [submittingList, setSubmittingList] = useState(false);

  // Form states for new item
  const [newItemContent, setNewItemContent] = useState("");
  const [newItemDueDate, setNewItemDueDate] = useState("");
  const [submittingItem, setSubmittingItem] = useState(false);

  // Edit states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  // Fetch all lists
  const fetchLists = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/lists");
      if (!res.ok) {
        throw new Error("Failed to fetch lists");
      }

      const data = await res.json();
      setLists(data.lists);

      // Set first list as active if none selected
      if (!activeListId && data.lists.length > 0) {
        setActiveListId(data.lists[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  // Handle create list
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingList(true);

    try {
      const res = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formListName,
          description: formListDescription || null,
          color: formListColor,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create list");
      }

      const data = await res.json();
      setLists([...lists, data.list]);
      setActiveListId(data.list.id);

      // Reset form
      setFormListName("");
      setFormListDescription("");
      setFormListColor("#10b981");
      setShowNewListForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create list");
    } finally {
      setSubmittingList(false);
    }
  };

  // Handle delete list
  const handleDeleteList = async (listId: string) => {
    if (!confirm("Are you sure you want to delete this list and all its items?")) {
      return;
    }

    try {
      const res = await fetch("/api/lists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete list");
      }

      const remainingLists = lists.filter((l) => l.id !== listId);
      setLists(remainingLists);

      if (activeListId === listId) {
        setActiveListId(remainingLists.length > 0 ? remainingLists[0].id : null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete list");
    }
  };

  // Handle create item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListId || !newItemContent.trim()) return;

    setSubmittingItem(true);

    try {
      const res = await fetch("/api/lists/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: activeListId,
          content: newItemContent,
          dueDate: newItemDueDate || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create item");
      }

      const data = await res.json();

      // Update active list with new item
      setLists(
        lists.map((list) =>
          list.id === activeListId
            ? { ...list, items: [...list.items, data.item] }
            : list
        )
      );

      setNewItemContent("");
      setNewItemDueDate("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create item");
    } finally {
      setSubmittingItem(false);
    }
  };

  // Handle toggle item done
  const handleToggleDone = async (itemId: string, currentDone: boolean) => {
    try {
      const res = await fetch("/api/lists/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, done: !currentDone }),
      });

      if (!res.ok) {
        throw new Error("Failed to update item");
      }

      const data = await res.json();

      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? data.item : item
          ),
        }))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  // Handle edit item
  const startEditItem = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditContent(item.content);
    setEditDueDate(item.dueDate || "");
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      const res = await fetch("/api/lists/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: itemId,
          content: editContent,
          dueDate: editDueDate || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update item");
      }

      const data = await res.json();

      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? data.item : item
          ),
        }))
      );

      setEditingItemId(null);
      setEditContent("");
      setEditDueDate("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const res = await fetch("/api/lists/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete item");
      }

      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
        }))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const activeList = lists.find((l) => l.id === activeListId);
  const totalItems = activeList?.items.length || 0;
  const completedItems = activeList?.items.filter((i) => i.done).length || 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Header with View Calendar Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Lists</h1>
            <p className="text-sm text-slate-500 mt-1">Organize tasks, shopping lists, and to-dos.</p>
          </div>
          <Link
            href="/calendar?calendar=lists"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            View in Calendar
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* List Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setActiveListId(list.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeListId === list.id
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {list.name}
            </button>
          ))}
          <button
            onClick={() => setShowNewListForm(true)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors whitespace-nowrap"
          >
            + New List
          </button>
        </div>

        {/* New List Form Modal */}
        {showNewListForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create New List</h2>
              <form onSubmit={handleCreateList}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    value={formListName}
                    onChange={(e) => setFormListName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formListDescription}
                    onChange={(e) => setFormListDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formListColor}
                    onChange={(e) => setFormListColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewListForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingList}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                  >
                    {submittingList ? "Creating..." : "Create List"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Active List Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading lists...</p>
          </div>
        ) : !activeList ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No lists yet. Create your first list!</p>
            <button
              onClick={() => setShowNewListForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Create List
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
            {/* List Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {activeList.name}
                </h2>
                {activeList.description && (
                  <p className="text-gray-600">{activeList.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {completedItems} / {totalItems} completed
                </p>
              </div>
              <button
                onClick={() => handleDeleteList(activeList.id)}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Delete List
              </button>
            </div>

            {/* Progress Bar */}
            {totalItems > 0 && (
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(completedItems / totalItems) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Add Item Form */}
            <form onSubmit={handleCreateItem} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemContent}
                  onChange={(e) => setNewItemContent(e.target.value)}
                  placeholder="Add a new item..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={newItemDueDate}
                  onChange={(e) => setNewItemDueDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={submittingItem || !newItemContent.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </form>

            {/* Items List */}
            <div className="space-y-2">
              {activeList.items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No items yet. Add your first item above!
                </p>
              ) : (
                activeList.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleDone(item.id, item.done)}
                      className="w-5 h-5 text-green-500 rounded focus:ring-2 focus:ring-green-500"
                    />

                    {/* Content */}
                    {editingItemId === item.id ? (
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        />
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => handleUpdateItem(item.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p
                            className={`${
                              item.done
                                ? "line-through text-gray-500"
                                : "text-gray-800"
                            }`}
                          >
                            {item.content}
                          </p>
                          {item.dueDate && (
                            <p className="text-sm text-gray-500">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => startEditItem(item)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
