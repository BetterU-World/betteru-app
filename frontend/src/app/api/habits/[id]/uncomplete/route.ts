import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { normalizeDate } from "@/lib/habits/streaks";

/**
 * POST /api/habits/[id]/uncomplete
 * Remove today's habit completion
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

    const { id: habitId } = await params;

    // Verify ownership
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const today = normalizeDate(new Date());

    // Delete completion if exists
    await prisma.habitCompletion.deleteMany({
      where: {
        habitId,
        date: today,
        userId,
      },
    });

    return NextResponse.json(
      { message: "Habit completion removed" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uncompleting habit:", error);
    return NextResponse.json(
      { error: "Failed to uncomplete habit" },
      { status: 500 }
    );
  }
}
