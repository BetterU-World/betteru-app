import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { getHabitStreak, normalizeDate } from "@/lib/habits/streaks";

/**
 * GET /api/habits
 * Returns all habits for authenticated user with today's completion status and streak
 */
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = normalizeDate(new Date());

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        completions: {
          where: {
            date: today,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Enrich habits with streak and completion status
    const enrichedHabits = await Promise.all(
      habits.map(async (habit) => {
        const streak = await getHabitStreak(habit.id);
        const isCompletedToday = habit.completions.length > 0;

        return {
          ...habit,
          streak,
          isCompletedToday,
          completions: undefined, // Remove completions array from response
        };
      })
    );

    return NextResponse.json({ habits: enrichedHabits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching habits:", error);
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/habits
 * Create a new habit
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, frequency, daysOfWeek } = body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const validFrequencies = ["daily", "weekly", "custom"];
    if (!frequency || !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency. Must be: daily, weekly, or custom" },
        { status: 400 }
      );
    }

    // Validate daysOfWeek for custom/weekly frequency
    if ((frequency === "custom" || frequency === "weekly") && !daysOfWeek) {
      return NextResponse.json(
        { error: "daysOfWeek is required for custom/weekly frequency" },
        { status: 400 }
      );
    }

    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    if (daysOfWeek && Array.isArray(daysOfWeek)) {
      const invalidDays = daysOfWeek.filter(
        (day) => !validDays.includes(day.toLowerCase())
      );
      if (invalidDays.length > 0) {
        return NextResponse.json(
          { error: `Invalid days: ${invalidDays.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        frequency,
        daysOfWeek: daysOfWeek || [],
      },
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error("Error creating habit:", error);
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}
