import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import {
  generateAndSaveAllSuggestions,
  fetchSuggestionsForUser,
} from "@/lib/suggestions/generator";

/**
 * POST /api/calendar-suggestions/generate
 * Generate new calendar suggestions from goals, habits, and diary entries
 */
export async function POST() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate and save all suggestions
    const result = await generateAndSaveAllSuggestions(userId);

    // Fetch updated suggestions list
    const suggestions = await fetchSuggestionsForUser(userId);

    return NextResponse.json(
      {
        message: "Suggestions generated successfully",
        generated: result.total,
        saved: result.saved,
        suggestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating calendar suggestions:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
