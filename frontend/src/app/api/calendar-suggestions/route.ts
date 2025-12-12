import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { fetchSuggestionsForUser } from "@/lib/suggestions/generator";

/**
 * GET /api/calendar-suggestions
 * Returns all active (non-dismissed) suggestions for authenticated user
 * Query params:
 *   - month: number (1-12)
 *   - year: number
 *   - from: YYYY-MM-DD
 *   - to: YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let dateRange: { from: Date; to: Date } | undefined;

    // Parse date range from query params
    if (from && to) {
      dateRange = {
        from: new Date(from),
        to: new Date(to),
      };
    } else if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      dateRange = {
        from: new Date(yearNum, monthNum - 1, 1),
        to: new Date(yearNum, monthNum, 0, 23, 59, 59, 999),
      };
    }

    const suggestions = await fetchSuggestionsForUser(userId, dateRange);

    return NextResponse.json({ suggestions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching calendar suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
