import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";

/**
 * PUT /api/habits/[id]
 * Update a habit
 */
export async function PUT(
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
    const body = await request.json();
    const { title, description, frequency, daysOfWeek } = body;

    // Verify ownership
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Validation
    const validFrequencies = ["daily", "weekly", "custom"];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        { error: "Invalid frequency" },
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

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: {
        title: title?.trim() || habit.title,
        description: description !== undefined ? description?.trim() : habit.description,
        frequency: frequency || habit.frequency,
        daysOfWeek: daysOfWeek || habit.daysOfWeek,
      },
    });

    return NextResponse.json({ habit: updatedHabit }, { status: 200 });
  } catch (error) {
    console.error("Error updating habit:", error);
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/habits/[id]
 * Delete a habit and all its completions
 */
export async function DELETE(
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

    // Verify ownership
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Delete habit suggestions
    await prisma.calendarSuggestion.deleteMany({
      where: {
        sourceType: "habit",
        sourceId: id,
      },
    });

    // Delete habit (completions will cascade delete)
    await prisma.habit.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Habit deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting habit:", error);
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}
