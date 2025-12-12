import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";

/**
 * GET /api/lists
 * Returns all lists for the authenticated user with their items included
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

    const lists = await prisma.list.findMany({
      where: { userId },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ lists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lists
 * Creates a new list
 * Body: { name: string, description?: string, color?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, color } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const newList = await prisma.list.create({
      data: {
        userId,
        name,
        description: description || null,
        color: color || "#10b981",
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ list: newList }, { status: 201 });
  } catch (error) {
    console.error("Error creating list:", error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lists
 * Updates a list
 * Body: { id: string, name?: string, description?: string, color?: string }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, name, description, color } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "List ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingList = await prisma.list.findFirst({
      where: { id, userId },
    });

    if (!existingList) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    const updateData: {
      name?: string;
      description?: string | null;
      color?: string;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    if (color !== undefined) updateData.color = color;

    const updatedList = await prisma.list.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ list: updatedList });
  } catch (error) {
    console.error("Error updating list:", error);
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lists
 * Deletes a list (cascade deletes all items)
 * Body: { id: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "List ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingList = await prisma.list.findFirst({
      where: { id, userId },
    });

    if (!existingList) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Delete list (items will cascade delete automatically)
    await prisma.list.delete({
      where: { id },
    });

    return NextResponse.json({ message: "List deleted successfully" });
  } catch (error) {
    console.error("Error deleting list:", error);
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
