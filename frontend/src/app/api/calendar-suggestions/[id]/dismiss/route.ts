import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";

/**
 * POST /api/calendar-suggestions/[id]/dismiss
 * Mark a suggestion as dismissed so it never shows again
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Find and verify ownership of the suggestion
    const suggestion = await prisma.calendarSuggestion.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    // Mark as dismissed
    await prisma.calendarSuggestion.update({
      where: { id },
      data: { dismissed: true },
    });

    return NextResponse.json(
      { message: "Suggestion dismissed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error dismissing suggestion:", error);
    return NextResponse.json(
      { error: "Failed to dismiss suggestion" },
      { status: 500 }
    );
  }
}
