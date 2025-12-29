import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { GoalStatus } from "@prisma/client";
import type { Goal } from "@prisma/client";
type GoalPriority = "LOW" | "MEDIUM" | "HIGH";

// GET /api/goals - List goals with optional filters
export async function GET(request: Request) {
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
    const statusParam = searchParams.get("status") as Goal["status"] | "ALL" | null;
    const category = searchParams.get("category");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const sort = searchParams.get("sort") || "targetDate";

    // Build where clause
    const where: {
      userId: string;
      status?: Goal["status"];
      category?: string;
      targetDate?: { gte?: Date; lte?: Date };
    } = { userId };

    if (statusParam && statusParam !== "ALL") {
      where.status = statusParam as Goal["status"];
    }

    if (category) {
      where.category = category;
    }

    if (fromParam || toParam) {
      where.targetDate = {};
      if (fromParam) where.targetDate.gte = new Date(fromParam);
      if (toParam) where.targetDate.lte = new Date(toParam);
    }

    // Fetch goals with steps and milestones
    const goals = await prisma.goal.findMany({
      where,
      include: {
        GoalStep: {
          orderBy: { order: "asc" },
        },
        Milestone: {
          orderBy: { order: "asc" },
        },
      },
      orderBy:
        sort === "createdAt"
          ? { createdAt: "desc" }
          : { targetDate: "asc" },
    });

    // Calculate summary
    const allGoals: Array<{ status: Goal["status"] }> = await prisma.goal.findMany({
      where: { userId },
      select: { status: true },
    });

    const summary = {
      total: allGoals.length,
      active: allGoals.filter(
        (g) => g.status === GoalStatus.NOT_STARTED || g.status === GoalStatus.IN_PROGRESS
      ).length,
      inProgress: allGoals.filter((g) => g.status === GoalStatus.IN_PROGRESS).length,
      completed: allGoals.filter((g) => g.status === GoalStatus.COMPLETED).length,
    };

    return NextResponse.json({ goals, summary });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return NextResponse.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

// POST /api/goals - Create a new goal
export async function POST(request: Request) {
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
    const {
      title,
      description,
      category,
      priority,
      startDate,
      targetDate,
      progress,
      status,
      steps,
      milestones,
    } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Goal title is required" },
        { status: 400 }
      );
    }

    if (!targetDate) {
      return NextResponse.json(
        { error: "Target date is required" },
        { status: 400 }
      );
    }

    // Create the goal with optional steps and milestones
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: title.trim(),
        description: description || "",
        category: category || "General",
        priority: priority || "MEDIUM",
        status: status || GoalStatus.NOT_STARTED,
        progress: progress || 0,
        startDate: startDate ? new Date(startDate) : null,
        targetDate: new Date(targetDate),
        GoalStep: steps?.length
          ? {
              create: steps.map((step: { title: string }, index: number) => ({
                title: step.title,
                order: index,
              })),
            }
          : undefined,
        Milestone: milestones?.length
          ? {
              create: milestones.map((m: { title: string; description?: string; dueDate?: string }, index: number) => ({
                userId,
                title: m.title,
                description: m.description || null,
                dueDate: m.dueDate ? new Date(m.dueDate) : null,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
        GoalStep: true,
        Milestone: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return NextResponse.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

// PATCH /api/goals - Update an existing goal
export async function PATCH(request: Request) {
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
    const {
      id,
      title,
      description,
      category,
      priority,
      startDate,
      targetDate,
      progress,
      status,
    } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    // Verify goal belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Build update data
    const updateData: {
      title?: string;
      description?: string;
      category?: string;
      priority?: GoalPriority;
      startDate?: Date | null;
      targetDate?: Date;
      progress?: number;
      status?: Goal["status"];
      completedAt?: Date | null;
    } = {};

    if (title && typeof title === "string" && title.trim().length > 0) {
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (category) {
      updateData.category = category;
    }
    if (priority) {
      updateData.priority = priority as GoalPriority;
    }
    if (startDate !== undefined) {
      updateData.startDate = startDate ? new Date(startDate) : null;
    }
    if (targetDate) {
      updateData.targetDate = new Date(targetDate);
    }
    if (progress !== undefined) {
      updateData.progress = Math.max(0, Math.min(100, progress));
    }
    if (status) {
      updateData.status = status as Goal["status"];
      // Set completedAt when marking as completed
      if (status === GoalStatus.COMPLETED && existingGoal.status !== GoalStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
      // Clear completedAt when moving away from completed
      if (status !== GoalStatus.COMPLETED && existingGoal.status === GoalStatus.COMPLETED) {
        updateData.completedAt = null;
      }
    }

    // Update the goal
    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        GoalStep: {
          orderBy: { order: "asc" },
        },
        Milestone: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

// DELETE /api/goals - Delete or archive a goal
export async function DELETE(request: Request) {
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
    const id = searchParams.get("id");
    const archive = searchParams.get("archive") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "Goal ID is required" },
        { status: 400 }
      );
    }

    // Verify goal belongs to user
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    if (archive) {
      // Soft delete by archiving
      await prisma.goal.update({
        where: { id },
        data: { status: GoalStatus.ARCHIVED },
      });
    } else {
      // Hard delete (GoalSteps will be cascade deleted)
      await prisma.goal.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
