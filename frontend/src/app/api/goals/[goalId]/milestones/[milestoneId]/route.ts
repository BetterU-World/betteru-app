import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";

/**
 * PUT /api/goals/[goalId]/milestones/[milestoneId]
 * Update a milestone
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ goalId: string; milestoneId: string }> }
) {
  const { goalId, milestoneId } = await params;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getPrismaUserIdFromClerk(clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Verify milestone exists and belongs to user
    const milestone = await prisma.goalMilestone.findFirst({
      where: {
        id: milestoneId,
        goalId,
        userId,
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, dueDate, completed, order } = body;

    const updateData: {
      title?: string;
      description?: string | null;
      dueDate?: Date | null;
      completed?: boolean;
      completedAt?: Date | null;
      order?: number;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (order !== undefined) updateData.order = order;

    if (completed !== undefined) {
      updateData.completed = completed;
      // Set completedAt when marking as completed
      if (completed && !milestone.completed) {
        updateData.completedAt = new Date();
      }
      // Clear completedAt when marking as incomplete
      if (!completed && milestone.completed) {
        updateData.completedAt = null;
      }
    }

    const updatedMilestone = await prisma.goalMilestone.update({
      where: { id: milestoneId },
      data: updateData,
    });

    return NextResponse.json(updatedMilestone);
  } catch (error) {
    console.error("Error updating milestone:", error);
    return NextResponse.json(
      { error: "Failed to update milestone" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/goals/[goalId]/milestones/[milestoneId]
 * Delete a milestone
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ goalId: string; milestoneId: string }> }
) {
  const { goalId, milestoneId } = await params;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getPrismaUserIdFromClerk(clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Verify milestone exists and belongs to user
    const milestone = await prisma.goalMilestone.findFirst({
      where: {
        id: milestoneId,
        goalId,
        userId,
      },
    });

    if (!milestone) {
      return NextResponse.json(
        { error: "Milestone not found" },
        { status: 404 }
      );
    }

    await prisma.goalMilestone.delete({
      where: { id: milestoneId },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting milestone:", error);
    return NextResponse.json(
      { error: "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
