"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarSuggestion } from "@prisma/client";
import { Sparkles, X, Check, Calendar } from "lucide-react";

interface SuggestionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: CalendarSuggestion[];
  onAccept: (suggestionId: string) => Promise<void>;
  onDismiss: (suggestionId: string) => Promise<void>;
  onGenerate: () => Promise<void>;
}

export function SuggestionsDialog({
  isOpen,
  onClose,
  suggestions,
  onAccept,
  onDismiss,
  onGenerate,
}: SuggestionsDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleAccept = async (suggestionId: string) => {
    setLoading(suggestionId);
    try {
      await onAccept(suggestionId);
    } finally {
      setLoading(null);
    }
  };

  const handleDismiss = async (suggestionId: string) => {
    setLoading(suggestionId);
    try {
      await onDismiss(suggestionId);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGenerate();
    } finally {
      setGenerating(false);
    }
  };

  // Group suggestions by date
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    const dateKey = new Date(suggestion.suggestedDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(suggestion);
    return acc;
  }, {} as Record<string, CalendarSuggestion[]>);

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "goal":
        return "🎯";
      case "habit":
        return "🔄";
      case "system":
        return "💡";
      default:
        return "✨";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Smart Calendar Suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Generate Button */}
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div>
              <p className="font-medium text-sm">Generate New Suggestions</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Analyze your goals, habits, and diary entries for smart recommendations
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              variant="outline"
              className="ml-4"
            >
              {generating ? "Generating..." : "Generate"}
            </Button>
          </div>

          {/* Suggestions List */}
          {suggestions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">No suggestions yet</p>
              <p className="text-sm">
                Click "Generate" to create smart calendar suggestions from your goals and activities
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSuggestions).map(([dateKey, dateSuggestions]) => (
                <div key={dateKey}>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {dateKey}
                  </h3>
                  <div className="space-y-3">
                    {dateSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getSourceIcon(suggestion.sourceType)}</span>
                              <h4 className="font-medium text-sm">{suggestion.title}</h4>
                            </div>
                            {suggestion.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {suggestion.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                                {suggestion.sourceType}
                              </span>
                              <span>
                                {new Date(suggestion.suggestedDate).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(suggestion.id)}
                              disabled={loading === suggestion.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDismiss(suggestion.id)}
                              disabled={loading === suggestion.id}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
