import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { getActiveGoalsSummary } from "@/lib/goals/queries";

/**
 * GET /api/goals/summary
 * Get goals summary for dashboard
 */
export async function GET() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getPrismaUserIdFromClerk(clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const summary = await getActiveGoalsSummary(userId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error fetching goals summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals summary" },
      { status: 500 }
    );
  }
}
