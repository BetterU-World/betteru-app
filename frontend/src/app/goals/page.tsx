"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";

interface GoalStep {
  id: string;
  title: string;
  done: boolean;
  order: number;
}

interface GoalMilestone {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  order: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | "ON_HOLD";
  priority: "LOW" | "MEDIUM" | "HIGH";
  progress: number;
  startDate: string | null;
  targetDate: string;
  completedAt: string | null;
  GoalStep: GoalStep[];
  Milestone: GoalMilestone[];
}

interface GoalSummary {
  total: number;
  active: number;
  inProgress: number;
  completed: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [summary, setSummary] = useState<GoalSummary>({
    total: 0,
    active: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // Form states
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formPriority, setFormPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [formStartDate, setFormStartDate] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formMilestones, setFormMilestones] = useState<Array<{ title: string; description: string; dueDate: string }>>([]);
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Fetch goals
  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);

      const res = await fetch(`/api/goals?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch goals");
      }

      const data = await res.json();
      setGoals(data.goals);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [statusFilter, categoryFilter]);

  // Handle create goal
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const milestones = formMilestones
        .filter((m) => m.title.trim().length > 0)
        .map((m) => ({
          title: m.title,
          description: m.description || null,
          dueDate: m.dueDate || null,
        }));

      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          category: formCategory,
          priority: formPriority,
          startDate: formStartDate || null,
          targetDate: formTargetDate,
          milestones,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create goal");
      }

      // Reset form
      setFormTitle("");
      setFormDescription("");
      setFormCategory("General");
      setFormPriority("MEDIUM");
      setFormStartDate("");
      setFormTargetDate("");
      setFormMilestones([]);
      setShowNewGoalForm(false);

      await fetchGoals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create goal");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update goal
  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: goalId, ...updates }),
      });

      if (!res.ok) {
        throw new Error("Failed to update goal");
      }

      await fetchGoals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update goal");
    }
  };

  // Handle delete goal
  const handleDeleteGoal = async (goalId: string, archive: boolean = false) => {
    if (!confirm(`Are you sure you want to ${archive ? "archive" : "delete"} this goal?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/goals?id=${goalId}&archive=${archive}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete goal");
      }

      const data = await res.json();
      if (!data?.success) {
        throw new Error("Failed to delete goal");
      }

      await fetchGoals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete goal");
    }
  };

  const addMilestone = () => {
    setFormMilestones([...formMilestones, { title: "", description: "", dueDate: "" }]);
  };

  const updateMilestone = (index: number, field: "title" | "description" | "dueDate", value: string) => {
    const newMilestones = [...formMilestones];
    newMilestones[index][field] = value;
    setFormMilestones(newMilestones);
  };

  const removeMilestone = (index: number) => {
    setFormMilestones(formMilestones.filter((_, i) => i !== index));
  };

  const toggleMilestone = async (goalId: string, milestoneId: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/goals/${goalId}/milestones/${milestoneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });

      if (!res.ok) {
        throw new Error("Failed to update milestone");
      }

      await fetchGoals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update milestone");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "bg-slate-100 text-slate-700";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "ARCHIVED":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const groupedGoals = {
    NOT_STARTED: goals.filter((g) => g.status === "NOT_STARTED"),
    IN_PROGRESS: goals.filter((g) => g.status === "IN_PROGRESS"),
    COMPLETED: goals.filter((g) => g.status === "COMPLETED"),
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Goals</h1>
            <p className="text-sm text-slate-500 mt-1">
              Set and track your personal and professional goals.
            </p>
          </div>
          <Link
            href="/calendar?calendar=goals"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>View in Calendar</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="ALL">All</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="Filter by category..."
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Summary cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="text-sm font-medium text-slate-600 mb-1">Total Goals</div>
              <div className="text-2xl font-bold text-slate-900">{summary.total}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="text-sm font-medium text-slate-600 mb-1">Active</div>
              <div className="text-2xl font-bold text-blue-600">{summary.active}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="text-sm font-medium text-slate-600 mb-1">In Progress</div>
              <div className="text-2xl font-bold text-yellow-600">{summary.inProgress}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="text-sm font-medium text-slate-600 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
            </div>
          </div>
        )}

        {/* New goal button */}
        <div className="mb-6">
          <button
            onClick={() => setShowNewGoalForm(!showNewGoalForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {showNewGoalForm ? "Cancel" : "+ New Goal"}
          </button>
        </div>

        {/* New goal form */}
        {showNewGoalForm && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>
            <form onSubmit={handleCreateGoal}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    placeholder="e.g., Launch my startup"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    rows={3}
                    placeholder="What does success look like?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    list="categories"
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    placeholder="e.g., Health, Career"
                  />
                  <datalist id="categories">
                    <option value="Health" />
                    <option value="Career" />
                    <option value="Finance" />
                    <option value="Personal" />
                    <option value="Education" />
                    <option value="Relationships" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Priority *
                  </label>
                  <div className="flex gap-2">
                    {(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormPriority(p)}
                        className={`flex-1 px-4 py-2 rounded text-sm font-medium ${
                          formPriority === p
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    required
                  />
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Milestones (Optional)
                </label>
                <p className="text-xs text-slate-500 mb-3">
                  Break your goal into key milestones with due dates to track progress.
                </p>
                {formMilestones.map((milestone, index) => (
                  <div key={index} className="bg-slate-50 p-3 rounded mb-3 border border-slate-200">
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(index, "title", e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
                        placeholder={`Milestone ${index + 1} title`}
                      />
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm mb-2"
                      placeholder="Description (optional)"
                    />
                    <input
                      type="date"
                      value={milestone.dueDate}
                      onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm"
                >
                  + Add Milestone
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Goal"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewGoalForm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals board */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading goals...</div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-500 mb-4">No goals yet. Create your first goal above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Not Started Column */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-slate-400 rounded-full mr-2"></span>
                Not Started ({groupedGoals.NOT_STARTED.length})
              </h3>
              <div className="space-y-4">
                {groupedGoals.NOT_STARTED.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                    onToggleMilestone={toggleMilestone}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                In Progress ({groupedGoals.IN_PROGRESS.length})
              </h3>
              <div className="space-y-4">
                {groupedGoals.IN_PROGRESS.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                    onToggleMilestone={toggleMilestone}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Completed ({groupedGoals.COMPLETED.length})
              </h3>
              <div className="space-y-4">
                {groupedGoals.COMPLETED.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                    onToggleMilestone={toggleMilestone}
                    getStatusColor={getStatusColor}
                    getPriorityColor={getPriorityColor}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Goal Card Component
function GoalCard({
  goal,
  onUpdate,
  onDelete,
  onToggleMilestone,
  getStatusColor,
  getPriorityColor,
  formatDate,
}: {
  goal: Goal;
  onUpdate: (id: string, updates: Partial<Goal>) => void;
  onDelete: (id: string, archive: boolean) => void;
  onToggleMilestone: (goalId: string, milestoneId: string, completed: boolean) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  formatDate: (date: string) => string;
}) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate progress from milestones if available
  const calculatedProgress = goal.Milestone?.length > 0
    ? Math.round((goal.Milestone.filter(m => m.completed).length / goal.Milestone.length) * 100)
    : goal.progress;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-slate-900 flex-1">{goal.title}</h4>
        <span className={`text-xs ${getPriorityColor(goal.priority)}`}>
          {goal.priority}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
          {goal.category}
        </span>
        <span className="text-xs text-slate-500">Due {formatDate(goal.targetDate)}</span>
      </div>

      {goal.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{goal.description}</p>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span>Progress</span>
          <span>{calculatedProgress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${calculatedProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Milestones */}
      {goal.Milestone && goal.Milestone.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-medium text-slate-600 mb-1">
            Milestones ({goal.Milestone.filter((m) => m.completed).length}/{goal.Milestone.length})
          </div>
          {showDetails && (
            <div className="space-y-2">
              {goal.Milestone.sort((a, b) => a.order - b.order).map((milestone) => (
                <div key={milestone.id} className="bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={() => onToggleMilestone(goal.id, milestone.id, !milestone.completed)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className={`text-xs font-medium ${milestone.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {milestone.title}
                      </div>
                      {milestone.description && (
                        <div className="text-xs text-slate-500 mt-0.5">{milestone.description}</div>
                      )}
                      {milestone.dueDate && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          📅 {formatDate(milestone.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              Show {goal.Milestone.length} milestones
            </button>
          )}
          {showDetails && (
            <button
              onClick={() => setShowDetails(false)}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Hide milestones
            </button>
          )}
        </div>
      )}

      {/* Legacy Steps (for backward compatibility) */}
      {goal.GoalStep && goal.GoalStep.length > 0 && !goal.Milestone?.length && (
        <div className="mb-3">
          <div className="text-xs font-medium text-slate-600 mb-1">
            Steps ({goal.GoalStep.filter((s) => s.done).length}/{goal.GoalStep.length})
          </div>
          {showDetails && (
            <div className="space-y-1">
              {goal.GoalStep.map((step) => (
                <div key={step.id} className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={step.done}
                    onChange={() => {
                      // Would need additional API endpoint to update steps
                      console.log("Update step", step.id);
                    }}
                    className="mr-2"
                  />
                  <span className={step.done ? "line-through text-slate-400" : ""}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!showDetails && goal.GoalStep.length > 0 && (
            <button
              onClick={() => setShowDetails(true)}
              className="text-xs text-blue-600 hover:underline"
            >
              Show {goal.GoalStep.length} steps
            </button>
          )}
          {showDetails && (
            <button
              onClick={() => setShowDetails(false)}
              className="text-xs text-blue-600 hover:underline mt-1"
            >
              Hide steps
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {goal.status === "NOT_STARTED" && (
          <button
            onClick={() => onUpdate(goal.id, { status: "IN_PROGRESS" })}
            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Start
          </button>
        )}
        {goal.status === "IN_PROGRESS" && (
          <button
            onClick={() => onUpdate(goal.id, { status: "COMPLETED", progress: 100 })}
            className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Complete
          </button>
        )}
        {goal.status === "COMPLETED" && (
          <button
            onClick={() => onUpdate(goal.id, { status: "IN_PROGRESS" })}
            className="text-xs px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
          >
            Reopen
          </button>
        )}
        <button
          onClick={() => onDelete(goal.id, true)}
          className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
        >
          Archive
        </button>
        <button
          onClick={() => onDelete(goal.id, false)}
          className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
