import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";

/**
 * POST /api/goals/[goalId]/milestones
 * Create a new milestone for a goal
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const { goalId } = await params;
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getPrismaUserIdFromClerk(clerkUserId);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    // Verify goal exists and belongs to user
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, dueDate, order } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Milestone title is required" },
        { status: 400 }
      );
    }

    // Get the current max order
    const maxOrderMilestone = await prisma.goalMilestone.findFirst({
      where: { goalId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const milestone = await prisma.goalMilestone.create({
      data: {
        userId,
        goalId,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: order ?? (maxOrderMilestone?.order ?? -1) + 1,
      },
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      { error: "Failed to create milestone" },
      { status: 500 }
    );
  }
}
