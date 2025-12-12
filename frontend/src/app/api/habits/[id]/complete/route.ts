import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { normalizeDate } from "@/lib/habits/streaks";

/**
 * POST /api/habits/[id]/complete
 * Mark habit as completed for today
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

    // Check if already completed
    const existingCompletion = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: today,
        },
      },
    });

    if (existingCompletion) {
      return NextResponse.json(
        { message: "Habit already completed today", completion: existingCompletion },
        { status: 200 }
      );
    }

    // Create completion
    const completion = await prisma.habitCompletion.create({
      data: {
        userId,
        habitId,
        date: today,
      },
    });

    return NextResponse.json(
      { message: "Habit marked as complete", completion },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error completing habit:", error);
    return NextResponse.json(
      { error: "Failed to complete habit" },
      { status: 500 }
    );
  }
}
