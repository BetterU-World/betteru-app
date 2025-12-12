import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { isHabitScheduledForDay } from "@/lib/habits/streaks";

/**
 * GET /api/habits/calendar?month=MM&year=YYYY
 * Returns all habit dates for the month (scheduled and completed)
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
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid month or year" },
        { status: 400 }
      );
    }

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        completions: {
          where: {
            date: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1),
            },
          },
        },
      },
    });

    // Build calendar data
    const scheduledDates: Record<string, boolean> = {};
    const completedDates: Record<string, boolean> = {};

    // Check each day of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0];

      for (const habit of habits) {
        if (isHabitScheduledForDay(habit, d)) {
          scheduledDates[dateKey] = true;
        }
      }
    }

    // Mark completed dates
    habits.forEach((habit) => {
      habit.completions.forEach((completion) => {
        const dateKey = completion.date.toISOString().split("T")[0];
        completedDates[dateKey] = true;
      });
    });

    return NextResponse.json(
      {
        scheduledDates: Object.keys(scheduledDates),
        completedDates: Object.keys(completedDates),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching habit calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch habit calendar" },
      { status: 500 }
    );
  }
}
