"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const pageUrl = useMemo(() => {
    const qs = searchParams?.toString();
    return qs ? `${pathname}?${qs}` : `${pathname}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    // no-op; hooks ensure pageUrl remains up to date
  }, [pageUrl]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const trimmed = message.trim();
    if (trimmed.length < 10) {
      alert("Message must be at least 10 characters.");
      return;
    }
    if (trimmed.length > 2000) {
      alert("Message must be at most 2000 characters.");
      return;
    }
    if (category && category.length > 30) {
      alert("Category must be at most 30 characters.");
      return;
    }
    if (pageUrl && pageUrl.length > 300) {
      alert("Page URL too long.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          category: category || undefined,
          pageUrl,
        }),
      });

      const data = await res.json().catch(() => ({} as { error?: string }));

      if (!res.ok) {
        const errMsg = data?.error || res.statusText || "Failed";
        alert(`Failed (${res.status}): ${errMsg}`);
        console.error("Feedback submit failed", { status: res.status, error: errMsg });
        return;
      }

      alert("Thanks! Feedback received.");
      setMessage("");
      setCategory("");
    } catch (err) {
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-semibold">Feedback</h1>
      <p className="text-sm text-muted-foreground">
        You're in an early beta. Thanks for helping us improve BetterU.
      </p>

      <SignedIn>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none"
            >
              <option value="">Select a category</option>
              <option value="Bug">Bug</option>
              <option value="Idea">Idea</option>
              <option value="Question">Question</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the bug, idea, or question..."
              className="min-h-[140px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 10 characters. Max 2000.
            </p>
          </div>

          <div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </SignedIn>

      <SignedOut>
        <div className="space-y-3">
          <p className="text-sm">Please sign in to submit feedback.</p>
          <SignInButton mode="modal">
            <Button>Sign In</Button>
          </SignInButton>
        </div>
      </SignedOut>
    </div>
  );
}
