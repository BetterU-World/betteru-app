"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";

interface FinanceTransaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string;
  category: string;
  description: string;
}

interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
}

export default function FinancialsPage() {
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    net: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [dateRange, setDateRange] = useState<"this-month" | "last-month" | "last-90" | "custom">("this-month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit modal states
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      let from = "";
      let to = "";

      if (dateRange === "custom") {
        from = customFrom;
        to = customTo;
      } else {
        const now = new Date();
        if (dateRange === "this-month") {
          from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
          to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
        } else if (dateRange === "last-month") {
          from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0];
          to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0];
        } else if (dateRange === "last-90") {
          to = now.toISOString().split("T")[0];
          from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        }
      }

      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      if (typeFilter !== "ALL") params.append("type", typeFilter);

      const res = await fetch(`/api/finances/transactions?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await res.json();
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [dateRange, customFrom, customTo, typeFilter]);

  // Handle form submission
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/finances/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          amount: parseFloat(formAmount),
          date: formDate,
          category: formCategory,
          description: formDescription,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create transaction");
      }

      // Reset form
      setFormAmount("");
      setFormCategory("");
      setFormDescription("");
      setShowAddForm(false);

      // Refetch transactions
      await fetchTransactions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create transaction");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/finances/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTransaction.id,
          type: formType,
          amount: parseFloat(formAmount),
          date: formDate,
          category: formCategory,
          description: formDescription,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update transaction");
      }

      setEditingTransaction(null);
      await fetchTransactions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update transaction");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      const res = await fetch(`/api/finances/transactions?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete transaction");
      }

      await fetchTransactions();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete transaction");
    }
  };

  // Open edit modal
  const openEditModal = (transaction: FinanceTransaction) => {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setFormAmount(transaction.amount.toString());
    setFormDate(transaction.date.split("T")[0]);
    setFormCategory(transaction.category);
    setFormDescription(transaction.description);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Finances</h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your income, expenses, and financial insights.
            </p>
          </div>
          <Link
            href="/calendar?calendar=finances"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center space-x-2"
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
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDateRange("this-month")}
                  className={`px-3 py-2 rounded text-sm ${
                    dateRange === "this-month"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setDateRange("last-month")}
                  className={`px-3 py-2 rounded text-sm ${
                    dateRange === "last-month"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Last Month
                </button>
                <button
                  onClick={() => setDateRange("last-90")}
                  className={`px-3 py-2 rounded text-sm ${
                    dateRange === "last-90"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Last 90 Days
                </button>
                <button
                  onClick={() => setDateRange("custom")}
                  className={`px-3 py-2 rounded text-sm ${
                    dateRange === "custom"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {dateRange === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "ALL" | "INCOME" | "EXPENSE")}
                className="px-3 py-2 border border-slate-300 rounded text-sm"
              >
                <option value="ALL">All</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="text-sm font-medium text-slate-600 mb-1">Total Income</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="text-sm font-medium text-slate-600 mb-1">Total Expenses</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="text-sm font-medium text-slate-600 mb-1">Net</div>
              <div
                className={`text-2xl font-bold ${
                  summary.net >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.net)}
              </div>
            </div>
          </div>
        )}

        {/* Add transaction button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {showAddForm ? "Cancel" : "+ Add Transaction"}
          </button>
        </div>

        {/* Add/Edit transaction form */}
        {(showAddForm || editingTransaction) && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingTransaction ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <form onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type *
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType("INCOME")}
                      className={`flex-1 px-4 py-2 rounded ${
                        formType === "INCOME"
                          ? "bg-green-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Income
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("EXPENSE")}
                      className={`flex-1 px-4 py-2 rounded ${
                        formType === "EXPENSE"
                          ? "bg-red-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      Expense
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    list="categories"
                    className="w-full px-3 py-2 border border-slate-300 rounded"
                    placeholder="e.g., Salary, Rent, Groceries"
                    required
                  />
                  <datalist id="categories">
                    <option value="Salary" />
                    <option value="Freelance" />
                    <option value="Investment" />
                    <option value="Rent" />
                    <option value="Groceries" />
                    <option value="Transportation" />
                    <option value="Entertainment" />
                    <option value="Utilities" />
                    <option value="Healthcare" />
                    <option value="Subscriptions" />
                  </datalist>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  rows={3}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingTransaction ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTransaction(null);
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transactions table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold">Transactions</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No transactions found. Add your first transaction above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            transaction.type === "INCOME"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {transaction.description || "-"}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                          transaction.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
